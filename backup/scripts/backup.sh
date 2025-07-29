#!/bin/bash

# Database Backup Script
# This script creates a PostgreSQL backup and uploads it to S3

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="/backup/temp"
LOG_DIR="/backup/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y-%m-%d")
YEAR=$(date +"%Y")
MONTH=$(date +"%m")
DAY=$(date +"%d")

# Database configuration
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-eleganttex}"
DB_USER="${DB_USER:-eleganttex}"
DB_PASSWORD="${DB_PASSWORD:-eleganttex}"

# S3 configuration
S3_BUCKET="${S3_BUCKET_NAME}"
S3_PREFIX="${BACKUP_S3_PREFIX:-db-backups}"
AWS_REGION="${S3_REGION:-us-east-1}"

# Backup configuration
BACKUP_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
NOTIFICATION_EMAIL="${BACKUP_NOTIFICATION_EMAIL}"

# File names
BACKUP_FILENAME="eleganttex_backup_${TIMESTAMP}.sql"
COMPRESSED_FILENAME="${BACKUP_FILENAME}.gz"
S3_DAILY_PATH="${S3_PREFIX}/daily/${YEAR}/${MONTH}/${DAY}/${COMPRESSED_FILENAME}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_DIR}/backup.log"
}

# Error handling function
handle_error() {
    local exit_code=$1
    local line_number=$2
    log "ERROR: Backup failed at line ${line_number} with exit code ${exit_code}"
    
    # Send failure notification
    "${SCRIPT_DIR}/notify.sh" "FAILURE" "Database backup failed at line ${line_number}" "${exit_code}"
    
    # Cleanup temporary files
    cleanup_temp_files
    
    exit ${exit_code}
}

# Cleanup function
cleanup_temp_files() {
    log "Cleaning up temporary files..."
    rm -f "${BACKUP_DIR}/${BACKUP_FILENAME}" "${BACKUP_DIR}/${COMPRESSED_FILENAME}"
}

# Set error trap
trap 'handle_error $? $LINENO' ERR

# Main backup function
main() {
    log "Starting database backup process..."
    
    # Check if backup is enabled
    if [[ "${BACKUP_ENABLED:-true}" != "true" ]]; then
        log "Backup is disabled. Exiting."
        exit 0
    fi
    
    # Validate required environment variables
    if [[ -z "${S3_BUCKET}" ]]; then
        log "ERROR: S3_BUCKET_NAME environment variable is not set"
        exit 1
    fi
    
    # Create backup directory if it doesn't exist
    mkdir -p "${BACKUP_DIR}"
    
    # Test database connection
    log "Testing database connection..."
    if ! PGPASSWORD="${DB_PASSWORD}" pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}"; then
        log "ERROR: Cannot connect to database"
        exit 1
    fi
    
    log "Database connection successful"
    
    # Create database backup
    log "Creating database backup..."
    PGPASSWORD="${DB_PASSWORD}" pg_dump \
        -h "${DB_HOST}" \
        -p "${DB_PORT}" \
        -U "${DB_USER}" \
        -d "${DB_NAME}" \
        --verbose \
        --no-password \
        --format=plain \
        --no-owner \
        --no-privileges \
        --create \
        --clean \
        --if-exists \
        > "${BACKUP_DIR}/${BACKUP_FILENAME}"
    
    # Verify backup file was created and is not empty
    if [[ ! -f "${BACKUP_DIR}/${BACKUP_FILENAME}" ]] || [[ ! -s "${BACKUP_DIR}/${BACKUP_FILENAME}" ]]; then
        log "ERROR: Backup file was not created or is empty"
        exit 1
    fi
    
    local backup_size=$(stat -f%z "${BACKUP_DIR}/${BACKUP_FILENAME}" 2>/dev/null || stat -c%s "${BACKUP_DIR}/${BACKUP_FILENAME}")
    log "Backup file created successfully (${backup_size} bytes)"
    
    # Compress backup
    log "Compressing backup file..."
    gzip -9 "${BACKUP_DIR}/${BACKUP_FILENAME}"
    
    # Verify compressed file
    if [[ ! -f "${BACKUP_DIR}/${COMPRESSED_FILENAME}" ]]; then
        log "ERROR: Compressed backup file was not created"
        exit 1
    fi
    
    local compressed_size=$(stat -f%z "${BACKUP_DIR}/${COMPRESSED_FILENAME}" 2>/dev/null || stat -c%s "${BACKUP_DIR}/${COMPRESSED_FILENAME}")
    log "Backup compressed successfully (${compressed_size} bytes)"
    
    # Upload to S3
    log "Uploading backup to S3..."
    aws s3 cp "${BACKUP_DIR}/${COMPRESSED_FILENAME}" "s3://${S3_BUCKET}/${S3_DAILY_PATH}" \
        --region "${AWS_REGION}" \
        --storage-class STANDARD_IA \
        --metadata "backup-date=${DATE},backup-type=daily,database=${DB_NAME}"
    
    # Verify S3 upload
    if aws s3 ls "s3://${S3_BUCKET}/${S3_DAILY_PATH}" --region "${AWS_REGION}" > /dev/null; then
        log "Backup uploaded to S3 successfully: s3://${S3_BUCKET}/${S3_DAILY_PATH}"
    else
        log "ERROR: Failed to verify S3 upload"
        exit 1
    fi
    
    # Create weekly backup on Sundays
    if [[ $(date +%u) -eq 7 ]]; then
        local week_number=$(date +%V)
        local s3_weekly_path="${S3_PREFIX}/weekly/${YEAR}/week-${week_number}/${COMPRESSED_FILENAME}"
        
        log "Creating weekly backup..."
        aws s3 cp "s3://${S3_BUCKET}/${S3_DAILY_PATH}" "s3://${S3_BUCKET}/${s3_weekly_path}" \
            --region "${AWS_REGION}" \
            --metadata "backup-date=${DATE},backup-type=weekly,database=${DB_NAME}"
        
        log "Weekly backup created: s3://${S3_BUCKET}/${s3_weekly_path}"
    fi
    
    # Create monthly backup on the 1st of each month
    if [[ $(date +%d) -eq 01 ]]; then
        local s3_monthly_path="${S3_PREFIX}/monthly/${YEAR}/${MONTH}/${COMPRESSED_FILENAME}"
        
        log "Creating monthly backup..."
        aws s3 cp "s3://${S3_BUCKET}/${S3_DAILY_PATH}" "s3://${S3_BUCKET}/${s3_monthly_path}" \
            --region "${AWS_REGION}" \
            --metadata "backup-date=${DATE},backup-type=monthly,database=${DB_NAME}"
        
        log "Monthly backup created: s3://${S3_BUCKET}/${s3_monthly_path}"
    fi
    
    # Cleanup temporary files
    cleanup_temp_files
    
    # Send success notification
    "${SCRIPT_DIR}/notify.sh" "SUCCESS" "Database backup completed successfully" "${compressed_size}"
    
    log "Backup process completed successfully"
}

# Run main function
main "$@"
