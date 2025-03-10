package com.tripzin.eleganttex.service;

import com.tripzin.eleganttex.config.FileStorageConfig;
import com.tripzin.eleganttex.exception.BadRequestException;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.AwsBasicCredentials;
import software.amazon.awssdk.auth.credentials.StaticCredentialsProvider;
import software.amazon.awssdk.core.ResponseInputStream;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.*;

import java.io.IOException;
import java.net.URL;
import java.time.Duration;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class S3Service {

    private final FileStorageConfig fileStorageConfig;
    private S3Client s3Client;

    @PostConstruct
    public void init() {
        if (fileStorageConfig.isUseS3Storage()) {
            // Get AWS credentials from environment variables
            String accessKey = System.getenv("AWS_ACCESS_KEY_ID");
            String secretKey = System.getenv("AWS_SECRET_ACCESS_KEY");

            if (accessKey == null || secretKey == null) {
                throw new IllegalStateException("AWS credentials not found. Make sure AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY are set in the environment.");
            }

            // Create S3 client
            s3Client = S3Client.builder()
                    .region(Region.of(fileStorageConfig.getS3Region()))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)))
                    .build();

            // Check if bucket exists, create if it doesn't
            try {
                s3Client.headBucket(HeadBucketRequest.builder()
                        .bucket(fileStorageConfig.getS3BucketName())
                        .build());
                log.info("S3 bucket '{}' exists", fileStorageConfig.getS3BucketName());
            } catch (NoSuchBucketException e) {
                log.info("S3 bucket '{}' does not exist, creating it", fileStorageConfig.getS3BucketName());
                createBucket();
            }
        }
    }

    private void createBucket() {
        try {
            CreateBucketRequest createBucketRequest = CreateBucketRequest.builder()
                    .bucket(fileStorageConfig.getS3BucketName())
                    .build();

            s3Client.createBucket(createBucketRequest);
            log.info("S3 bucket '{}' created successfully", fileStorageConfig.getS3BucketName());

            // Set bucket policy based on public access setting
            if (fileStorageConfig.isS3PublicAccess()) {
                // Make bucket public
                s3Client.putPublicAccessBlock(PutPublicAccessBlockRequest.builder()
                        .bucket(fileStorageConfig.getS3BucketName())
                        .publicAccessBlockConfiguration(PublicAccessBlockConfiguration.builder()
                                .blockPublicAcls(false)
                                .ignorePublicAcls(false)
                                .blockPublicPolicy(false)
                                .restrictPublicBuckets(false)
                                .build())
                        .build());

                // Set bucket policy to allow public read
                String bucketPolicy = String.format(
                        "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Principal\":\"*\",\"Action\":\"s3:GetObject\",\"Resource\":\"arn:aws:s3:::%s/*\"}]}",
                        fileStorageConfig.getS3BucketName());

                s3Client.putBucketPolicy(PutBucketPolicyRequest.builder()
                        .bucket(fileStorageConfig.getS3BucketName())
                        .policy(bucketPolicy)
                        .build());

                log.info("S3 bucket '{}' set to public access", fileStorageConfig.getS3BucketName());
            }
        } catch (S3Exception e) {
            log.error("Error creating S3 bucket: {}", e.getMessage());
            throw new RuntimeException("Failed to create S3 bucket", e);
        }
    }

    public void uploadFile(String key, byte[] content, String contentType) {
        if (!fileStorageConfig.isUseS3Storage()) {
            throw new IllegalStateException("S3 storage is not enabled");
        }

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(fileStorageConfig.getS3BucketName())
                    .key(key)
                    .contentType(contentType)
                    .metadata(Map.of("Content-Type", contentType))
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(content));
            log.debug("File uploaded to S3 with key: {}", key);
        } catch (S3Exception e) {
            log.error("Error uploading file to S3: {}", e.getMessage());
            throw new RuntimeException("Failed to upload file to S3", e);
        }
    }

    public byte[] downloadFile(String key) {
        if (!fileStorageConfig.isUseS3Storage()) {
            throw new IllegalStateException("S3 storage is not enabled");
        }

        try {
            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(fileStorageConfig.getS3BucketName())
                    .key(key)
                    .build();

            ResponseInputStream<GetObjectResponse> response = s3Client.getObject(getObjectRequest);
            return response.readAllBytes();
        } catch (NoSuchKeyException e) {
            log.error("File not found in S3: {}", key);
            throw new BadRequestException("File not found: " + key);
        } catch (S3Exception | IOException e) {
            log.error("Error downloading file from S3: {}", e.getMessage());
            throw new RuntimeException("Failed to download file from S3", e);
        }
    }

    public void deleteFile(String key) {
        if (!fileStorageConfig.isUseS3Storage()) {
            throw new IllegalStateException("S3 storage is not enabled");
        }

        try {
            DeleteObjectRequest deleteObjectRequest = DeleteObjectRequest.builder()
                    .bucket(fileStorageConfig.getS3BucketName())
                    .key(key)
                    .build();

            s3Client.deleteObject(deleteObjectRequest);
            log.debug("File deleted from S3 with key: {}", key);
        } catch (S3Exception e) {
            log.error("Error deleting file from S3: {}", e.getMessage());
            throw new RuntimeException("Failed to delete file from S3", e);
        }
    }

    public URL generatePresignedUrl(String key, Duration expiration) {
        if (!fileStorageConfig.isUseS3Storage()) {
            throw new IllegalStateException("S3 storage is not enabled");
        }

        try {
            // Get AWS credentials from environment variables
            String accessKey = System.getenv("AWS_ACCESS_KEY_ID");
            String secretKey = System.getenv("AWS_SECRET_ACCESS_KEY");

            software.amazon.awssdk.services.s3.presigner.S3Presigner presigner = software.amazon.awssdk.services.s3.presigner.S3Presigner.builder()
                    .region(Region.of(fileStorageConfig.getS3Region()))
                    .credentialsProvider(StaticCredentialsProvider.create(
                            AwsBasicCredentials.create(accessKey, secretKey)))
                    .build();

            GetObjectRequest getObjectRequest = GetObjectRequest.builder()
                    .bucket(fileStorageConfig.getS3BucketName())
                    .key(key)
                    .build();

            software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest presignRequest = software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.builder()
                    .signatureDuration(expiration)
                    .getObjectRequest(getObjectRequest)
                    .build();

            software.amazon.awssdk.services.s3.presigner.model.PresignedGetObjectRequest presignedRequest = presigner.presignGetObject(presignRequest);
            return presignedRequest.url();
        } catch (S3Exception e) {
            log.error("Error generating presigned URL: {}", e.getMessage());
            throw new RuntimeException("Failed to generate presigned URL", e);
        }
    }

    public String getPublicUrl(String key) {
        if (!fileStorageConfig.isUseS3Storage()) {
            throw new IllegalStateException("S3 storage is not enabled");
        }

        if (!fileStorageConfig.isS3PublicAccess()) {
            throw new IllegalStateException("S3 bucket is not configured for public access");
        }

        return String.format("https://%s.s3.%s.amazonaws.com/%s",
                fileStorageConfig.getS3BucketName(),
                fileStorageConfig.getS3Region(),
                key);
    }
}
