package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.config.FileStorageConfig;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.exception.BadRequestException;
import com.tripzin.eleganttex.exception.ResourceNotFoundException;
import com.tripzin.eleganttex.repository.FileStorageRepository;
import com.tripzin.eleganttex.repository.MarketplaceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class FileStorageService {
    
    private final FileStorageRepository fileStorageRepository;
    private final FileStorageConfig fileStorageConfig;
    private final MarketplaceRepository marketplaceRepository;
    private final S3Service s3Service;
    
    @Transactional
    public FileStorage storeFile(MultipartFile file, String entityType, Long entityId) {
        // Validate file
        if (file.isEmpty()) {
            throw new BadRequestException("Cannot store empty file");
        }
        
        // Validate file size
        if (file.getSize() > fileStorageConfig.getMaxFileSize()) {
            throw new BadRequestException("File size exceeds maximum limit");
        }
        
        // Validate file type
        String fileExtension = getFileExtension(file);
        if (!fileStorageConfig.getAllowedFileTypesList().contains(fileExtension.toLowerCase())) {
            throw new BadRequestException("File type not allowed. Allowed types: " + 
                                         fileStorageConfig.getAllowedFileTypes());
        }
        
        try {
            // Generate unique filename
            String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
            String uniqueFilename = UUID.randomUUID() + "_" + originalFilename;
            
            // Save file metadata to database first
            FileStorage fileStorage = FileStorage.builder()
                    .fileName(uniqueFilename)
                    .fileType(file.getContentType())
                    .filePath(uniqueFilename) // Store just the filename, not the full path
                    .fileSize(file.getSize())
                    .entityType(entityType)
                    .entityId(entityId)
                    .build();
            
            fileStorage = fileStorageRepository.save(fileStorage);
            
            // Store file based on configuration
            if (fileStorageConfig.isUseS3Storage()) {
                // Upload to S3
                try {
                    s3Service.uploadFile(
                            uniqueFilename,
                            file.getBytes(),
                            file.getContentType()
                    );
                    log.debug("File uploaded to S3: {}", uniqueFilename);
                } catch (Exception e) {
                    // If S3 upload fails, delete the database record and rethrow
                    fileStorageRepository.delete(fileStorage);
                    throw new RuntimeException("Failed to upload file to S3: " + e.getMessage(), e);
                }
            } else {
                // Store locally
                // Create upload directory if it doesn't exist
                Path uploadPath = fileStorageConfig.getUploadPath();
                if (!Files.exists(uploadPath)) {
                    Files.createDirectories(uploadPath);
                }
                
                // Save file to disk
                Path targetLocation = uploadPath.resolve(uniqueFilename);
                Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
                log.debug("File saved to local storage: {}", targetLocation);
            }
            
            return fileStorage;
        } catch (IOException ex) {
            throw new RuntimeException("Failed to store file", ex);
        }
    }
    
    public FileStorage getFile(Long id) {
        return fileStorageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("File not found with id: " + id));
    }
    
    public List<FileStorage> getFilesByEntity(String entityType, Long entityId) {
        return fileStorageRepository.findByEntityTypeAndEntityId(entityType, entityId);
    }
    
    @Transactional
    public void deleteFile(Long id) {
        FileStorage fileStorage = getFile(id);
        
        // Check if the file is referenced by any marketplace
        if (marketplaceRepository.existsByImageId(id)) {
            throw new BadRequestException("Cannot delete file because it is referenced by one or more marketplaces. " +
                                         "Please update or delete the marketplaces first.");
        }
        
        try {
            if (fileStorageConfig.isUseS3Storage()) {
                // Delete from S3
                try {
                    s3Service.deleteFile(fileStorage.getFilePath());
                    log.debug("File successfully deleted from S3: {}", fileStorage.getFilePath());
                } catch (Exception e) {
                    log.error("Error deleting file from S3: {}", e.getMessage());
                    throw new RuntimeException("Failed to delete file from S3", e);
                }
            } else {
                // Delete file from local disk
                Path uploadPath = fileStorageConfig.getUploadPath();
                Path filePath = uploadPath.resolve(fileStorage.getFilePath());
                
                log.debug("Attempting to delete file at path: {}", filePath.toString());
                
                if (Files.deleteIfExists(filePath)) {
                    log.debug("File successfully deleted from disk: {}", filePath.toString());
                } else {
                    log.warn("File not found on disk when attempting to delete: {}", filePath.toString());
                }
            }
            
            // Delete metadata from database
            fileStorageRepository.delete(fileStorage);
        } catch (IOException ex) {
            log.error("Error deleting file: {}", ex.getMessage());
            throw new RuntimeException("Failed to delete file", ex);
        }
    }
    
    @Transactional
    public void deleteFilesByEntity(String entityType, Long entityId) {
        List<FileStorage> files = getFilesByEntity(entityType, entityId);
        
        for (FileStorage file : files) {
            // Check if the file is referenced by any marketplace
            if (marketplaceRepository.existsByImageId(file.getId())) {
                log.warn("File with ID {} is referenced by a marketplace and will not be deleted", file.getId());
                continue;
            }
            
            try {
                if (fileStorageConfig.isUseS3Storage()) {
                    // Delete from S3
                    try {
                        s3Service.deleteFile(file.getFilePath());
                        log.debug("File successfully deleted from S3: {}", file.getFilePath());
                    } catch (Exception e) {
                        log.error("Error deleting file from S3: {}", e.getMessage());
                        // Continue with other files even if one fails
                        continue;
                    }
                } else {
                    // Delete from local storage
                    Path uploadPath = fileStorageConfig.getUploadPath();
                    Path filePath = uploadPath.resolve(file.getFilePath());
                    
                    if (Files.deleteIfExists(filePath)) {
                        log.debug("File successfully deleted from disk: {}", filePath.toString());
                    } else {
                        log.warn("File not found on disk when attempting to delete: {}", filePath.toString());
                    }
                }
                
                // Delete metadata from database for this specific file
                fileStorageRepository.delete(file);
            } catch (IOException ex) {
                log.error("Error deleting file: {}", ex.getMessage());
            }
        }
    }
    
    private String getFileExtension(MultipartFile file) {
        String originalFilename = StringUtils.cleanPath(Objects.requireNonNull(file.getOriginalFilename()));
        return originalFilename.substring(originalFilename.lastIndexOf(".") + 1);
    }
}
