# S3 Storage Implementation for Fabrics Module

This document outlines how the Fabrics module uses S3 storage for storing fabric images.

## Overview

The Fabrics module leverages the existing S3 storage infrastructure to store and retrieve fabric images. The implementation follows the same pattern as the Marketplace module, using the `FileStorageService` to handle file operations.

## Key Components

### Backend

1. **FileStorageService**: Used to store, retrieve, and delete fabric images.
   - `storeFile(MultipartFile file, String entityType, Long entityId)`: Stores a file in S3 and returns a `FileStorage` entity.
   - `getFile(Long id)`: Retrieves a file by its ID.
   - `deleteFile(Long id)`: Deletes a file by its ID.

2. **FabricController**: Provides endpoints for fabric image upload.
   - `POST /fabrics/{id}/image`: Uploads an image for a specific fabric.

3. **FabricService**: Manages fabric data and associated images.
   - Handles image references when creating, updating, or deleting fabrics.
   - Ensures proper cleanup of orphaned images.

### Frontend

1. **FileUpload Component**: Reused from the common components to handle file selection and upload.

2. **ImagePreview Component**: Reused to display fabric images.

3. **FabricForm Component**: Integrates file upload and image preview for fabric management.

4. **fileStorage.service.ts**: Provides functions to get file URLs.
   - `getFileUrl(id: number)`: Returns the URL for a file by its ID.

## Database Structure

The fabrics module uses the existing `file_storage` table with the following structure:

```sql
CREATE TABLE file_storage (
    id BIGSERIAL PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path VARCHAR(255) NOT NULL,
    file_size BIGINT,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

For fabric images, the `entity_type` is set to "FABRIC" and the `entity_id` is set to the fabric's ID.

## Usage Flow

1. **Creating a Fabric**:
   - User creates a fabric without an image initially.
   - After creation, they can upload an image using the fabric detail view.

2. **Updating a Fabric Image**:
   - When a user uploads a new image for an existing fabric, the old image is deleted if it exists.
   - The new image is stored in S3, and the fabric's `imageId` is updated.

3. **Deleting a Fabric**:
   - When a fabric is deleted, its associated image is also deleted if it's not referenced by other entities.

## Configuration

The S3 storage configuration is managed through the existing `FileStorageConfig` class and environment variables:

```
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=your_region
AWS_S3_BUCKET=your_bucket_name
```

## Error Handling

- The system handles various error scenarios, such as invalid file types, file size limits, and S3 connectivity issues.
- Appropriate error messages are displayed to users when file operations fail.

## Future Improvements

1. **Batch Upload**: Implement functionality to upload multiple fabric images at once.
2. **Image Optimization**: Add server-side image optimization to reduce storage and bandwidth usage.
3. **Direct S3 Upload**: Implement direct browser-to-S3 uploads for improved performance.
