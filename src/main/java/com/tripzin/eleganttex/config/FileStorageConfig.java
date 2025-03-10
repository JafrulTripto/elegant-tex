package com.tripzin.eleganttex.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Arrays;
import java.util.List;

@Configuration
@ConfigurationProperties(prefix = "app.file-storage")
@Getter
@Setter
public class FileStorageConfig {
    
    private String uploadDir;
    private String allowedFileTypes;
    private long maxFileSize;
    
    // S3 specific properties
    private boolean useS3Storage;
    private String s3BucketName;
    private String s3Region;
    private boolean s3PublicAccess;
    
    public Path getUploadPath() {
        return Paths.get(uploadDir).toAbsolutePath().normalize();
    }
    
    public List<String> getAllowedFileTypesList() {
        return Arrays.asList(allowedFileTypes.split(","));
    }
}
