#!/bin/bash

# Database Restore Test Script
# This script performs monthly recovery tests to verify backup integrity

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="/backup/temp"
LOG_DIR="/backup/logs"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
DATE=$(date +"%Y-%m-%d")
YEAR=$(date +"%Y")
MONTH=$(date +"%m")

# Database configuration
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-eleganttex}"
DB_USER="${DB_USER:-eleganttex}"
DB_PASSWORD="${DB_PASSWORD:-eleganttex}"

# Test database configuration
TEST_DB_NAME="eleganttex_restore_test_${TIMESTAMP}"

# S3 configuration
S3_BUCKET="${S3_BUCKET_NAME}"
S3_PREFIX="${BACKUP_S3_PREFIX:-db-backups}"
AWS_REGION="${S3_REGION:-us-east-1}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_DIR}/restore-test.log"
}

# Error handling function
handle_error() {
    local exit_code=$1
    local line_number=$2
    log "ERROR: Restore test failed at line ${line_number} with exit code ${exit_code}"
    
    # Cleanup test database
    cleanup_test_database
    
    # Send failure notification
    "${SCRIPT_DIR}/notify.sh" "RESTORE_TEST_FAILURE" "Database restore test failed at line ${line_number}" "${exit_code}"
    
    exit ${exit_code}
}

# Cleanup function
cleanup_test_database() {
    log "Cleaning up test database..."
    
    # Drop test database if it exists
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres \
        -c "DROP DATABASE IF EXISTS ${TEST_DB_NAME};" 2>/dev/null || true
    
    # Remove temporary files
    rm -f "${BACKUP_DIR}/restore_test_backup.sql.gz" "${BACKUP_DIR}/restore_test_backup.sql"
}

# Set error trap
trap 'handle_error $? $LINENO' ERR

# Function to find the most recent backup
find_latest_backup() {
    log "Finding the most recent backup..."
    
    # Try to find today's backup first
    local today_backup=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/daily/${YEAR}/${MONTH}/" \
        --region "${AWS_REGION}" --recursive | grep "$(date +%d)" | tail -1 | awk '{print $4}' || echo "")
    
    if [[ -n "${today_backup}" ]]; then
        echo "${today_backup}"
        return
    fi
    
    # If no today's backup, find the most recent daily backup
    local latest_backup=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/daily/" \
        --region "${AWS_REGION}" --recursive | tail -1 | awk '{print $4}' || echo "")
    
    if [[ -n "${latest_backup}" ]]; then
        echo "${latest_backup}"
        return
    fi
    
    # If no daily backup, try weekly
    local weekly_backup=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/weekly/" \
        --region "${AWS_REGION}" --recursive | tail -1 | awk '{print $4}' || echo "")
    
    if [[ -n "${weekly_backup}" ]]; then
        echo "${weekly_backup}"
        return
    fi
    
    # If no weekly backup, try monthly
    local monthly_backup=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/monthly/" \
        --region "${AWS_REGION}" --recursive | tail -1 | awk '{print $4}' || echo "")
    
    echo "${monthly_backup}"
}

# Function to download backup from S3
download_backup() {
    local backup_key="$1"
    local local_file="${BACKUP_DIR}/restore_test_backup.sql.gz"
    
    log "Downloading backup: ${backup_key}"
    
    aws s3 cp "s3://${S3_BUCKET}/${backup_key}" "${local_file}" --region "${AWS_REGION}"
    
    # Verify download
    if [[ ! -f "${local_file}" ]] || [[ ! -s "${local_file}" ]]; then
        log "ERROR: Failed to download backup file"
        exit 1
    fi
    
    local file_size=$(stat -f%z "${local_file}" 2>/dev/null || stat -c%s "${local_file}")
    log "Backup downloaded successfully (${file_size} bytes)"
    
    echo "${local_file}"
}

# Function to decompress backup
decompress_backup() {
    local compressed_file="$1"
    local decompressed_file="${BACKUP_DIR}/restore_test_backup.sql"
    
    log "Decompressing backup file..."
    
    gunzip -c "${compressed_file}" > "${decompressed_file}"
    
    # Verify decompression
    if [[ ! -f "${decompressed_file}" ]] || [[ ! -s "${decompressed_file}" ]]; then
        log "ERROR: Failed to decompress backup file"
        exit 1
    fi
    
    local file_size=$(stat -f%z "${decompressed_file}" 2>/dev/null || stat -c%s "${decompressed_file}")
    log "Backup decompressed successfully (${file_size} bytes)"
    
    echo "${decompressed_file}"
}

# Function to create test database
create_test_database() {
    log "Creating test database: ${TEST_DB_NAME}"
    
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d postgres \
        -c "CREATE DATABASE ${TEST_DB_NAME};"
    
    log "Test database created successfully"
}

# Function to restore backup to test database
restore_backup() {
    local backup_file="$1"
    
    log "Restoring backup to test database..."
    
    # Restore the backup
    PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${TEST_DB_NAME}" \
        -f "${backup_file}" -v ON_ERROR_STOP=1
    
    log "Backup restored successfully"
}

# Function to verify restore integrity
verify_restore() {
    log "Verifying restore integrity..."
    
    # Count tables in test database
    local table_count=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${TEST_DB_NAME}" \
        -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public';" | tr -d ' ')
    
    log "Found ${table_count} tables in restored database"
    
    # Verify some key tables exist
    local key_tables=("users" "orders" "fabrics" "customers" "marketplaces")
    local missing_tables=()
    
    for table in "${key_tables[@]}"; do
        local exists=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${TEST_DB_NAME}" \
            -t -c "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = '${table}';" | tr -d ' ')
        
        if [[ "${exists}" -eq 0 ]]; then
            missing_tables+=("${table}")
        fi
    done
    
    if [[ ${#missing_tables[@]} -gt 0 ]]; then
        log "ERROR: Missing key tables: ${missing_tables[*]}"
        exit 1
    fi
    
    # Count records in key tables
    for table in "${key_tables[@]}"; do
        local record_count=$(PGPASSWORD="${DB_PASSWORD}" psql -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${TEST_DB_NAME}" \
            -t -c "SELECT COUNT(*) FROM ${table};" | tr -d ' ' 2>/dev/null || echo "0")
        
        log "Table ${table}: ${record_count} records"
    done
    
    log "Restore integrity verification completed successfully"
}

# Function to save restore test backup
save_test_backup() {
    local backup_file="$1"
    local test_backup_key="${S3_PREFIX}/recovery-tests/${YEAR}/${MONTH}/restore_test_${TIMESTAMP}.sql.gz"
    
    log "Saving restore test backup to S3..."
    
    # Compress the backup file
    gzip -c "${backup_file}" > "${backup_file}.gz"
    
    # Upload to S3
    aws s3 cp "${backup_file}.gz" "s3://${S3_BUCKET}/${test_backup_key}" \
        --region "${AWS_REGION}" \
        --metadata "test-date=${DATE},test-type=restore-verification,database=${DB_NAME}"
    
    log "Restore test backup saved: s3://${S3_BUCKET}/${test_backup_key}"
    
    # Clean up local compressed file
    rm -f "${backup_file}.gz"
}

# Main restore test function
main() {
    log "Starting database restore test..."
    
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
    
    # Find the latest backup
    local latest_backup_key=$(find_latest_backup)
    if [[ -z "${latest_backup_key}" ]]; then
        log "ERROR: No backup files found in S3"
        exit 1
    fi
    
    log "Using backup: ${latest_backup_key}"
    
    # Download backup
    local downloaded_backup=$(download_backup "${latest_backup_key}")
    
    # Decompress backup
    local decompressed_backup=$(decompress_backup "${downloaded_backup}")
    
    # Create test database
    create_test_database
    
    # Restore backup
    restore_backup "${decompressed_backup}"
    
    # Verify restore
    verify_restore
    
    # Save test backup for future reference
    save_test_backup "${decompressed_backup}"
    
    # Cleanup
    cleanup_test_database
    
    # Send success notification
    "${SCRIPT_DIR}/notify.sh" "RESTORE_TEST_SUCCESS" "Database restore test completed successfully" "${latest_backup_key}"
    
    log "Database restore test completed successfully"
}

# Run main function
main "$@"
