package com.tripzin.eleganttex.util;

import com.tripzin.eleganttex.entity.Fabric;
import com.tripzin.eleganttex.entity.FileStorage;
import com.tripzin.eleganttex.entity.Marketplace;
import com.tripzin.eleganttex.repository.FabricRepository;
import com.tripzin.eleganttex.repository.FileStorageRepository;
import com.tripzin.eleganttex.repository.MarketplaceRepository;
import com.tripzin.eleganttex.service.S3Service;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Utility class for migrating files from local storage to S3.
 * This class provides methods to migrate marketplace and fabric images to S3.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class S3MigrationUtil {

    private final S3Service s3Service;
    private final FileStorageRepository fileStorageRepository;
    private final MarketplaceRepository marketplaceRepository;
    private final FabricRepository fabricRepository;

    @Value("${app.file-storage.upload-dir:uploads}")
    private String uploadDir;

    /**
     * Migrates all marketplace images from local storage to S3.
     * This method should be called once during application startup or via an admin endpoint.
     */
    @Transactional
    public void migrateMarketplaceImagesToS3() {
        log.info("Starting migration of marketplace images to S3");
        
        List<Marketplace> marketplaces = marketplaceRepository.findAll();
        int totalCount = marketplaces.size();
        int successCount = 0;
        int failCount = 0;
        
        for (Marketplace marketplace : marketplaces) {
            if (marketplace.getImageId() != null) {
                try {
                    FileStorage fileStorage = fileStorageRepository.findById(marketplace.getImageId())
                            .orElse(null);
                    
                    if (fileStorage != null && !fileStorage.getFilePath().startsWith("s3://")) {
                        migrateFileToS3(fileStorage, "MARKETPLACE", marketplace.getId());
                        successCount++;
                    }
                } catch (Exception e) {
                    log.error("Error migrating marketplace image: {}", e.getMessage());
                    failCount++;
                }
            }
        }
        
        log.info("Marketplace image migration completed. Total: {}, Success: {}, Failed: {}", 
                totalCount, successCount, failCount);
    }
    
    /**
     * Migrates all fabric images from local storage to S3.
     * This method should be called once during application startup or via an admin endpoint.
     */
    @Transactional
    public void migrateFabricImagesToS3() {
        log.info("Starting migration of fabric images to S3");
        
        List<Fabric> fabrics = fabricRepository.findAll();
        int totalCount = fabrics.size();
        int successCount = 0;
        int failCount = 0;
        
        for (Fabric fabric : fabrics) {
            if (fabric.getImageId() != null) {
                try {
                    FileStorage fileStorage = fileStorageRepository.findById(fabric.getImageId())
                            .orElse(null);
                    
                    if (fileStorage != null && !fileStorage.getFilePath().startsWith("s3://")) {
                        migrateFileToS3(fileStorage, "FABRIC", fabric.getId());
                        successCount++;
                    }
                } catch (Exception e) {
                    log.error("Error migrating fabric image: {}", e.getMessage());
                    failCount++;
                }
            }
        }
        
        log.info("Fabric image migration completed. Total: {}, Success: {}, Failed: {}", 
                totalCount, successCount, failCount);
    }
    
    /**
     * Migrates a single file from local storage to S3.
     * 
     * @param fileStorage The FileStorage entity to migrate
     * @param entityType The type of entity (e.g., "MARKETPLACE", "FABRIC")
     * @param entityId The ID of the entity
     * @throws IOException If an I/O error occurs
     */
    private void migrateFileToS3(FileStorage fileStorage, String entityType, Long entityId) throws IOException {
        // Get the local file path
        Path localFilePath = Paths.get(uploadDir, fileStorage.getFilePath());
        File localFile = localFilePath.toFile();
        
        if (!localFile.exists()) {
            log.error("Local file not found: {}", localFilePath);
            return;
        }
        
        // Read file content
        byte[] fileContent = Files.readAllBytes(localFilePath);
        
        // Upload to S3
        String s3Key = entityType.toLowerCase() + "/" + entityId + "/" + fileStorage.getFileName();
        s3Service.uploadFile(s3Key, fileContent, fileStorage.getFileType());
        
        // Update file storage entity with S3 path
        String s3Path = "s3://" + s3Key;
        fileStorage.setFilePath(s3Path);
        fileStorageRepository.save(fileStorage);
        
        log.info("Migrated file to S3: {}", s3Path);
    }
    
    /**
     * Migrates all files from local storage to S3.
     * This method combines the migration of marketplace and fabric images.
     */
    @Transactional
    public void migrateAllFilesToS3() {
        migrateMarketplaceImagesToS3();
        migrateFabricImagesToS3();
        
        // Find any remaining files that haven't been migrated
        List<FileStorage> remainingFiles = fileStorageRepository.findAll().stream()
                .filter(file -> !file.getFilePath().startsWith("s3://"))
                .collect(Collectors.toList());
        
        log.info("Found {} remaining files to migrate", remainingFiles.size());
        
        int successCount = 0;
        int failCount = 0;
        
        for (FileStorage fileStorage : remainingFiles) {
            try {
                migrateFileToS3(fileStorage, fileStorage.getEntityType(), fileStorage.getEntityId());
                successCount++;
            } catch (Exception e) {
                log.error("Error migrating file: {}", e.getMessage());
                failCount++;
            }
        }
        
        log.info("Remaining file migration completed. Total: {}, Success: {}, Failed: {}", 
                remainingFiles.size(), successCount, failCount);
    }
}
