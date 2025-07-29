#!/bin/bash

# Health Check Script
# This script monitors the backup system health

set -euo pipefail

# Configuration
LOG_DIR="/backup/logs"
BACKUP_DIR="/backup/temp"

# S3 configuration
S3_BUCKET="${S3_BUCKET_NAME}"
S3_PREFIX="${BACKUP_S3_PREFIX:-db-backups}"
AWS_REGION="${S3_REGION:-us-east-1}"

# Database configuration
DB_HOST="${DB_HOST:-db}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-eleganttex}"
DB_USER="${DB_USER:-eleganttex}"
DB_PASSWORD="${DB_PASSWORD:-eleganttex}"

# Health check thresholds
MAX_LOG_SIZE_MB=100
MAX_TEMP_SIZE_MB=500
BACKUP_ALERT_HOURS=26  # Alert if no backup in 26 hours (daily + 2 hour buffer)

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_DIR}/health.log"
}

# Function to check disk space
check_disk_space() {
    log "Checking disk space..."
    
    local backup_disk_usage=$(df "${BACKUP_DIR}" | awk 'NR==2 {print $5}' | sed 's/%//')
    local log_disk_usage=$(df "${LOG_DIR}" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [[ ${backup_disk_usage} -gt 90 ]]; then
        log "WARNING: Backup directory disk usage is ${backup_disk_usage}%"
        return 1
    fi
    
    if [[ ${log_disk_usage} -gt 90 ]]; then
        log "WARNING: Log directory disk usage is ${log_disk_usage}%"
        return 1
    fi
    
    log "Disk space OK - Backup: ${backup_disk_usage}%, Logs: ${log_disk_usage}%"
    return 0
}

# Function to check log file sizes
check_log_sizes() {
    log "Checking log file sizes..."
    
    local large_logs=()
    
    for log_file in "${LOG_DIR}"/*.log; do
        if [[ -f "${log_file}" ]]; then
            local size_mb=$(( $(stat -f%z "${log_file}" 2>/dev/null || stat -c%s "${log_file}") / 1024 / 1024 ))
            
            if [[ ${size_mb} -gt ${MAX_LOG_SIZE_MB} ]]; then
                large_logs+=("$(basename "${log_file}"):${size_mb}MB")
            fi
        fi
    done
    
    if [[ ${#large_logs[@]} -gt 0 ]]; then
        log "WARNING: Large log files detected: ${large_logs[*]}"
        return 1
    fi
    
    log "Log file sizes OK"
    return 0
}

# Function to check temporary directory
check_temp_directory() {
    log "Checking temporary directory..."
    
    if [[ -d "${BACKUP_DIR}" ]]; then
        local temp_size_mb=$(du -sm "${BACKUP_DIR}" 2>/dev/null | cut -f1 || echo "0")
        
        if [[ ${temp_size_mb} -gt ${MAX_TEMP_SIZE_MB} ]]; then
            log "WARNING: Temporary directory size is ${temp_size_mb}MB (threshold: ${MAX_TEMP_SIZE_MB}MB)"
            
            # List large files in temp directory
            find "${BACKUP_DIR}" -type f -size +10M -exec ls -lh {} \; | while read -r line; do
                log "Large temp file: ${line}"
            done
            
            return 1
        fi
        
        log "Temporary directory size OK: ${temp_size_mb}MB"
    else
        log "Temporary directory does not exist, creating..."
        mkdir -p "${BACKUP_DIR}"
    fi
    
    return 0
}

# Function to check database connectivity
check_database_connection() {
    log "Checking database connection..."
    
    if PGPASSWORD="${DB_PASSWORD}" pg_isready -h "${DB_HOST}" -p "${DB_PORT}" -U "${DB_USER}" -d "${DB_NAME}" -q; then
        log "Database connection OK"
        return 0
    else
        log "ERROR: Cannot connect to database"
        return 1
    fi
}

# Function to check S3 connectivity
check_s3_connection() {
    log "Checking S3 connection..."
    
    if [[ -z "${S3_BUCKET}" ]]; then
        log "WARNING: S3_BUCKET_NAME not configured"
        return 1
    fi
    
    if aws s3 ls "s3://${S3_BUCKET}" --region "${AWS_REGION}" > /dev/null 2>&1; then
        log "S3 connection OK"
        return 0
    else
        log "ERROR: Cannot access S3 bucket ${S3_BUCKET}"
        return 1
    fi
}

# Function to check recent backups
check_recent_backups() {
    log "Checking for recent backups..."
    
    if [[ -z "${S3_BUCKET}" ]]; then
        log "WARNING: S3_BUCKET_NAME not configured, skipping backup check"
        return 1
    fi
    
    # Get the most recent backup
    local latest_backup=$(aws s3 ls "s3://${S3_BUCKET}/${S3_PREFIX}/daily/" --region "${AWS_REGION}" --recursive | tail -1 | awk '{print $1, $2}' || echo "")
    
    if [[ -z "${latest_backup}" ]]; then
        log "WARNING: No backups found in S3"
        return 1
    fi
    
    # Parse the backup date
    local backup_date=$(echo "${latest_backup}" | cut -d' ' -f1)
    local backup_time=$(echo "${latest_backup}" | cut -d' ' -f2)
    local backup_timestamp="${backup_date} ${backup_time}"
    
    # Calculate hours since last backup
    local backup_epoch=$(date -d "${backup_timestamp}" +%s 2>/dev/null || echo "0")
    local current_epoch=$(date +%s)
    local hours_since_backup=$(( (current_epoch - backup_epoch) / 3600 ))
    
    if [[ ${hours_since_backup} -gt ${BACKUP_ALERT_HOURS} ]]; then
        log "WARNING: Last backup was ${hours_since_backup} hours ago (${backup_timestamp})"
        return 1
    fi
    
    log "Recent backup found: ${hours_since_backup} hours ago (${backup_timestamp})"
    return 0
}

# Function to check cron service
check_cron_service() {
    log "Checking cron service..."
    
    if pgrep crond > /dev/null; then
        log "Cron service is running"
        return 0
    else
        log "ERROR: Cron service is not running"
        return 1
    fi
}

# Function to check backup scripts
check_backup_scripts() {
    log "Checking backup scripts..."
    
    local scripts=("backup.sh" "cleanup.sh" "restore-test.sh" "notify.sh")
    local missing_scripts=()
    
    for script in "${scripts[@]}"; do
        local script_path="/backup/scripts/${script}"
        
        if [[ ! -f "${script_path}" ]]; then
            missing_scripts+=("${script}")
        elif [[ ! -x "${script_path}" ]]; then
            log "WARNING: Script ${script} is not executable"
            chmod +x "${script_path}"
        fi
    done
    
    if [[ ${#missing_scripts[@]} -gt 0 ]]; then
        log "ERROR: Missing backup scripts: ${missing_scripts[*]}"
        return 1
    fi
    
    log "All backup scripts are present and executable"
    return 0
}

# Function to generate health report
generate_health_report() {
    local overall_status="$1"
    local failed_checks="$2"
    
    local report_file="${LOG_DIR}/health-report-$(date +%Y%m%d_%H%M%S).txt"
    
    {
        echo "=== Database Backup System Health Report ==="
        echo "Generated: $(date)"
        echo "Overall Status: ${overall_status}"
        echo ""
        
        if [[ -n "${failed_checks}" ]]; then
            echo "Failed Checks:"
            echo "${failed_checks}"
            echo ""
        fi
        
        echo "System Information:"
        echo "- Hostname: $(hostname)"
        echo "- Uptime: $(uptime)"
        echo "- Disk Usage:"
        df -h | grep -E "(Filesystem|/backup|/var/log)" || df -h
        echo ""
        
        echo "Recent Log Entries:"
        echo "- Backup Log:"
        tail -5 "${LOG_DIR}/backup.log" 2>/dev/null || echo "No backup log found"
        echo ""
        echo "- Cleanup Log:"
        tail -5 "${LOG_DIR}/cleanup.log" 2>/dev/null || echo "No cleanup log found"
        echo ""
        echo "- Restore Test Log:"
        tail -5 "${LOG_DIR}/restore-test.log" 2>/dev/null || echo "No restore test log found"
        
    } > "${report_file}"
    
    log "Health report generated: ${report_file}"
    echo "${report_file}"
}

# Main health check function
main() {
    log "Starting health check..."
    
    local failed_checks=()
    local overall_status="HEALTHY"
    
    # Run all health checks
    check_disk_space || failed_checks+=("disk_space")
    check_log_sizes || failed_checks+=("log_sizes")
    check_temp_directory || failed_checks+=("temp_directory")
    check_database_connection || failed_checks+=("database_connection")
    check_s3_connection || failed_checks+=("s3_connection")
    check_recent_backups || failed_checks+=("recent_backups")
    check_cron_service || failed_checks+=("cron_service")
    check_backup_scripts || failed_checks+=("backup_scripts")
    
    # Determine overall status
    if [[ ${#failed_checks[@]} -gt 0 ]]; then
        overall_status="UNHEALTHY"
        log "Health check completed with issues: ${failed_checks[*]}"
        
        # Generate health report
        local report_file=$(generate_health_report "${overall_status}" "${failed_checks[*]}")
        
        # Send alert if configured
        if [[ -n "${BACKUP_NOTIFICATION_EMAIL:-}" ]]; then
            /backup/scripts/notify.sh "HEALTH_ALERT" "Backup system health check failed" "Failed checks: ${failed_checks[*]}" "${report_file}" || true
        fi
        
        exit 1
    else
        log "Health check completed successfully - all systems operational"
        exit 0
    fi
}

# Run main function
main "$@"
