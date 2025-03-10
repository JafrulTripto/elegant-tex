package com.tripzin.eleganttex.controller;

import com.tripzin.eleganttex.config.FileStorageConfig;
import com.tripzin.eleganttex.dto.response.MessageResponse;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.service.FileStorageService;
import com.tripzin.eleganttex.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/files")
@RequiredArgsConstructor
@Slf4j
public class FileStorageController {
    
    private final FileStorageService fileStorageService;
    private final FileStorageConfig fileStorageConfig;
    private final S3Service s3Service;
    
    @PostMapping("/upload")
    public ResponseEntity<FileStorage> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("entityType") String entityType,
            @RequestParam("entityId") Long entityId) {
        
        FileStorage storedFile = fileStorageService.storeFile(file, entityType, entityId);
        return ResponseEntity.ok(storedFile);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<?> downloadFile(@PathVariable Long id) {
        try {
            FileStorage fileStorage = fileStorageService.getFile(id);
            
            Resource resource;
            
            if (fileStorageConfig.isUseS3Storage()) {
                // Get file from S3
                try {
                    byte[] fileContent = s3Service.downloadFile(fileStorage.getFilePath());
                    resource = new ByteArrayResource(fileContent);
                } catch (Exception e) {
                    log.error("Error downloading file from S3: {}", e.getMessage());
                    return ResponseEntity.status(500)
                            .body(new MessageResponse("Error downloading file from S3: " + e.getMessage()));
                }
            } else {
                // Get file from local storage
                // Construct the full path using the upload directory and the stored filename
                Path uploadPath = fileStorageConfig.getUploadPath();
                Path filePath = uploadPath.resolve(fileStorage.getFilePath());
                
                log.debug("Attempting to access file at path: {}", filePath.toString());
                
                // Check if file exists before trying to create a resource
                if (!Files.exists(filePath)) {
                    log.warn("File does not exist at path: {}", filePath.toString());
                    return ResponseEntity.notFound()
                            .build();
                }
                
                resource = new UrlResource(filePath.toUri());
                
                if (!resource.exists() || !resource.isReadable()) {
                    log.error("File exists but is not readable: {}", filePath.toString());
                    return ResponseEntity.status(500)
                            .body(new MessageResponse("Could not read the file"));
                }
            }
            
            return ResponseEntity.ok()
                    .contentType(MediaType.parseMediaType(fileStorage.getFileType()))
                    .header(HttpHeaders.CONTENT_DISPOSITION, 
                            "attachment; filename=\"" + fileStorage.getFileName() + "\"")
                    .body(resource);
        } catch (IOException ex) {
            log.error("IO Exception when accessing file: {}", ex.getMessage());
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Error accessing file: " + ex.getMessage()));
        } catch (Exception ex) {
            log.error("Unexpected error when accessing file: {}", ex.getMessage());
            return ResponseEntity.status(500)
                    .body(new MessageResponse("Unexpected error: " + ex.getMessage()));
        }
    }
    
    @GetMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<List<FileStorage>> getFilesByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        
        List<FileStorage> files = fileStorageService.getFilesByEntity(entityType, entityId);
        return ResponseEntity.ok(files);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<MessageResponse> deleteFile(@PathVariable Long id) {
        fileStorageService.deleteFile(id);
        return ResponseEntity.ok(MessageResponse.success("File deleted successfully"));
    }
    
    @DeleteMapping("/entity/{entityType}/{entityId}")
    public ResponseEntity<MessageResponse> deleteFilesByEntity(
            @PathVariable String entityType,
            @PathVariable Long entityId) {
        
        fileStorageService.deleteFilesByEntity(entityType, entityId);
        return ResponseEntity.ok(MessageResponse.success("Files deleted successfully"));
    }
}
