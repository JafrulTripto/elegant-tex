#!/bin/bash

# Backup Cleanup Script
# This script manages backup retention policies

set -euo pipefail

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
LOG_DIR="/backup/logs"

# S3 configuration
S3_BUCKET="${S3_BUCKET_NAME}"
S3_PREFIX="${BACKUP_S3_PREFIX:-db-backups}"
AWS_REGION="${S3_REGION:-us-east-1}"

# Retention configuration
DAILY_RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-30}"
WEEKLY_RETENTION_WEEKS="${BACKUP_WEEKLY_RETENTION:-12}"  # 3 months
MONTHLY_RETENTION_MONTHS="${BACKUP_MONTHLY_RETENTION:-12}"  # 1 year

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_DIR}/cleanup.log"
}

# Error handling function
handle_error() {
    local exit_code=$1
    local line_number=$2
    log "ERROR: Cleanup failed at line ${line_number} with exit code ${exit_code}"
    
    # Send failure notification
    "${SCRIPT_DIR}/notify.sh" "CLEANUP_FAILURE" "Backup cleanup failed at line ${line_number}" "${exit_code}"
    
    exit ${exit_code}
}

# Set error trap
trap 'handle_error $? $LINENO' ERR

# Function to cleanup daily backups
cleanup_daily_backups() {
    log "Cleaning up daily backups older than ${DAILY_RETENTION_DAYS} days..."
    
    local cutoff_date=$(date -d "${DAILY_RETENTION_DAYS} days ago" +%Y-%m-%d)
    local deleted_count=0
    
    # List all daily backups
    aws s3api list-objects-v2 \
        --bucket "${S3_BUCKET}" \
        --prefix "${S3_PREFIX}/daily/" \
        --query "Contents[?LastModified<'${cutoff_date}'].Key" \
        --output text \
        --region "${AWS_REGION}" | while read -r key; do
        
        if [[ -n "${key}" && "${key}" != "None" ]]; then
            log "Deleting old daily backup: ${key}"
            aws s3 rm "s3://${S3_BUCKET}/${key}" --region "${AWS_REGION}"
            ((deleted_count++))
        fi
    done
    
    log "Deleted ${deleted_count} old daily backups"
}

# Function to cleanup weekly backups
cleanup_weekly_backups() {
    log "Cleaning up weekly backups older than ${WEEKLY_RETENTION_WEEKS} weeks..."
    
    local cutoff_date=$(date -d "${WEEKLY_RETENTION_WEEKS} weeks ago" +%Y-%m-%d)
    local deleted_count=0
    
    # List all weekly backups
    aws s3api list-objects-v2 \
        --bucket "${S3_BUCKET}" \
        --prefix "${S3_PREFIX}/weekly/" \
        --query "Contents[?LastModified<'${cutoff_date}'].Key" \
        --output text \
        --region "${AWS_REGION}" | while read -r key; do
        
        if [[ -n "${key}" && "${key}" != "None" ]]; then
            log "Deleting old weekly backup: ${key}"
            aws s3 rm "s3://${S3_BUCKET}/${key}" --region "${AWS_REGION}"
            ((deleted_count++))
        fi
    done
    
    log "Deleted ${deleted_count} old weekly backups"
}

# Function to cleanup monthly backups
cleanup_monthly_backups() {
    log "Cleaning up monthly backups older than ${MONTHLY_RETENTION_MONTHS} months..."
    
    local cutoff_date=$(date -d "${MONTHLY_RETENTION_MONTHS} months ago" +%Y-%m-%d)
    local deleted_count=0
    
    # List all monthly backups
    aws s3api list-objects-v2 \
        --bucket "${S3_BUCKET}" \
        --prefix "${S3_PREFIX}/monthly/" \
        --query "Contents[?LastModified<'${cutoff_date}'].Key" \
        --output text \
        --region "${AWS_REGION}" | while read -r key; do
        
        if [[ -n "${key}" && "${key}" != "None" ]]; then
            log "Deleting old monthly backup: ${key}"
            aws s3 rm "s3://${S3_BUCKET}/${key}" --region "${AWS_REGION}"
            ((deleted_count++))
        fi
    done
    
    log "Deleted ${deleted_count} old monthly backups"
}

# Function to cleanup recovery test backups
cleanup_recovery_test_backups() {
    log "Cleaning up recovery test backups older than 3 months..."
    
    local cutoff_date=$(date -d "3 months ago" +%Y-%m-%d)
    local deleted_count=0
    
    # List all recovery test backups
    aws s3api list-objects-v2 \
        --bucket "${S3_BUCKET}" \
        --prefix "${S3_PREFIX}/recovery-tests/" \
        --query "Contents[?LastModified<'${cutoff_date}'].Key" \
        --output text \
        --region "${AWS_REGION}" | while read -r key; do
        
        if [[ -n "${key}" && "${key}" != "None" ]]; then
            log "Deleting old recovery test backup: ${key}"
            aws s3 rm "s3://${S3_BUCKET}/${key}" --region "${AWS_REGION}"
            ((deleted_count++))
        fi
    done
    
    log "Deleted ${deleted_count} old recovery test backups"
}

# Function to generate storage report
generate_storage_report() {
    log "Generating storage usage report..."
    
    local report_file="${LOG_DIR}/storage-report-$(date +%Y%m%d).txt"
    
    {
        echo "=== Database Backup Storage Report ==="
        echo "Generated: $(date)"
        echo ""
        
        echo "Daily Backups:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/daily/" --recursive --human-readable --summarize --region "${AWS_REGION}" || echo "No daily backups found"
        echo ""
        
        echo "Weekly Backups:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/weekly/" --recursive --human-readable --summarize --region "${AWS_REGION}" || echo "No weekly backups found"
        echo ""
        
        echo "Monthly Backups:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/monthly/" --recursive --human-readable --summarize --region "${AWS_REGION}" || echo "No monthly backups found"
        echo ""
        
        echo "Recovery Test Backups:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/recovery-tests/" --recursive --human-readable --summarize --region "${AWS_REGION}" || echo "No recovery test backups found"
        echo ""
        
        echo "Total Storage Usage:"
        aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/" --recursive --human-readable --summarize --region "${AWS_REGION}"
        
    } > "${report_file}"
    
    log "Storage report generated: ${report_file}"
    
    # Send storage report via email if configured
    if [[ -n "${BACKUP_NOTIFICATION_EMAIL:-}" ]]; then
        "${SCRIPT_DIR}/notify.sh" "STORAGE_REPORT" "Weekly storage usage report" "${report_file}"
    fi
}

# Main cleanup function
main() {
    log "Starting backup cleanup process..."
    
    # Validate required environment variables
    if [[ -z "${S3_BUCKET}" ]]; then
        log "ERROR: S3_BUCKET_NAME environment variable is not set"
        exit 1
    fi
    
    # Test AWS CLI access
    if ! aws s3 ls "s3://${S3_BUCKET}" --region "${AWS_REGION}" > /dev/null 2>&1; then
        log "ERROR: Cannot access S3 bucket ${S3_BUCKET}"
        exit 1
    fi
    
    # Perform cleanup operations
    cleanup_daily_backups
    cleanup_weekly_backups
    cleanup_monthly_backups
    cleanup_recovery_test_backups
    
    # Generate storage report
    generate_storage_report
    
    log "Backup cleanup process completed successfully"
}

# Run main function
main "$@"
