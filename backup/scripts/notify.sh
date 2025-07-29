#!/bin/bash

# Notification Script
# This script sends email notifications for backup events

set -euo pipefail

# Configuration
LOG_DIR="/backup/logs"

# Email configuration
NOTIFICATION_EMAIL="${BACKUP_NOTIFICATION_EMAIL}"
SMTP_SERVER="${MAIL_SMTP_SERVER:-smtp.gmail.com}"
SMTP_PORT="${MAIL_SMTP_PORT:-587}"
SMTP_USER="${MAIL_USERNAME}"
SMTP_PASSWORD="${MAIL_PASSWORD}"
FROM_EMAIL="${MAIL_FROM:-${SMTP_USER}}"

# Application configuration
APP_NAME="Elegant Tex Database Backup"
APP_URL="${APP_FRONTEND_URL:-http://localhost:3000}"

# Logging function
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "${LOG_DIR}/notify.log"
}

# Function to send email using curl (SMTP)
send_email_smtp() {
    local to_email="$1"
    local subject="$2"
    local body="$3"
    local attachment="$4"
    
    # Create temporary email file
    local email_file="/tmp/email_${RANDOM}.txt"
    
    # Build email headers and body
    {
        echo "From: ${FROM_EMAIL}"
        echo "To: ${to_email}"
        echo "Subject: ${subject}"
        echo "Content-Type: text/html; charset=UTF-8"
        echo ""
        echo "${body}"
    } > "${email_file}"
    
    # Send email using curl
    if [[ -n "${attachment}" && -f "${attachment}" ]]; then
        # Send with attachment (for storage reports)
        curl -s --url "smtps://${SMTP_SERVER}:${SMTP_PORT}" \
            --ssl-reqd \
            --mail-from "${FROM_EMAIL}" \
            --mail-rcpt "${to_email}" \
            --user "${SMTP_USER}:${SMTP_PASSWORD}" \
            --upload-file "${email_file}" \
            --form "attachment=@${attachment}"
    else
        # Send without attachment
        curl -s --url "smtps://${SMTP_SERVER}:${SMTP_PORT}" \
            --ssl-reqd \
            --mail-from "${FROM_EMAIL}" \
            --mail-rcpt "${to_email}" \
            --user "${SMTP_USER}:${SMTP_PASSWORD}" \
            --upload-file "${email_file}"
    fi
    
    # Clean up
    rm -f "${email_file}"
}

# Function to format file size
format_file_size() {
    local size="$1"
    
    if [[ -z "${size}" || "${size}" == "0" ]]; then
        echo "Unknown"
        return
    fi
    
    if [[ ${size} -lt 1024 ]]; then
        echo "${size} B"
    elif [[ ${size} -lt 1048576 ]]; then
        echo "$(( size / 1024 )) KB"
    elif [[ ${size} -lt 1073741824 ]]; then
        echo "$(( size / 1048576 )) MB"
    else
        echo "$(( size / 1073741824 )) GB"
    fi
}

# Function to create HTML email template
create_html_email() {
    local status="$1"
    local message="$2"
    local details="$3"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    
    local status_color="#28a745"  # Green for success
    local status_icon="✅"
    
    case "${status}" in
        "FAILURE"|"CLEANUP_FAILURE"|"RESTORE_TEST_FAILURE")
            status_color="#dc3545"  # Red for failure
            status_icon="❌"
            ;;
        "SUCCESS")
            status_color="#28a745"  # Green for success
            status_icon="✅"
            ;;
        "RESTORE_TEST_SUCCESS")
            status_color="#17a2b8"  # Blue for test success
            status_icon="🔍"
            ;;
        "STORAGE_REPORT")
            status_color="#6f42c1"  # Purple for reports
            status_icon="📊"
            ;;
    esac
    
    cat << EOF
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${APP_NAME} - ${status}</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; text-align: center; }
        .header h1 { margin: 0; font-size: 24px; }
        .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; margin: 10px 0; background-color: ${status_color}; color: white; }
        .content { padding: 30px; }
        .message { font-size: 18px; margin-bottom: 20px; }
        .details { background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid ${status_color}; margin: 20px 0; }
        .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 12px; color: #666; }
        .timestamp { color: #666; font-size: 14px; }
        .button { display: inline-block; padding: 12px 24px; background: ${status_color}; color: white; text-decoration: none; border-radius: 5px; margin: 10px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>${status_icon} ${APP_NAME}</h1>
            <div class="status-badge">${status}</div>
        </div>
        <div class="content">
            <div class="message">${message}</div>
            <div class="timestamp">Timestamp: ${timestamp}</div>
            <div class="details">
                <strong>Details:</strong><br>
                ${details}
            </div>
        </div>
        <div class="footer">
            <p>This is an automated notification from ${APP_NAME}</p>
            <p>Application URL: <a href="${APP_URL}">${APP_URL}</a></p>
            <p>Server: $(hostname)</p>
        </div>
    </div>
</body>
</html>
EOF
}

# Main notification function
main() {
    local notification_type="$1"
    local message="$2"
    local details="${3:-}"
    local attachment="${4:-}"
    
    log "Sending ${notification_type} notification..."
    
    # Check if email notifications are configured
    if [[ -z "${NOTIFICATION_EMAIL}" ]]; then
        log "No notification email configured. Skipping notification."
        return 0
    fi
    
    if [[ -z "${SMTP_USER}" || -z "${SMTP_PASSWORD}" ]]; then
        log "SMTP credentials not configured. Skipping email notification."
        return 0
    fi
    
    # Prepare email content based on notification type
    local subject=""
    local formatted_details=""
    
    case "${notification_type}" in
        "SUCCESS")
            subject="✅ Database Backup Completed Successfully"
            local file_size=$(format_file_size "${details}")
            formatted_details="Backup completed successfully.<br>Compressed file size: ${file_size}<br>Backup stored in S3 with daily, weekly, and monthly retention."
            ;;
        "FAILURE")
            subject="❌ Database Backup Failed"
            formatted_details="Backup process failed.<br>Error: ${details}<br>Please check the backup logs for more information."
            ;;
        "CLEANUP_FAILURE")
            subject="❌ Backup Cleanup Failed"
            formatted_details="Backup cleanup process failed.<br>Error: ${details}<br>Old backups may not have been removed properly."
            ;;
        "RESTORE_TEST_SUCCESS")
            subject="🔍 Database Restore Test Completed Successfully"
            formatted_details="Monthly restore test completed successfully.<br>Backup used: ${details}<br>Database integrity verified."
            ;;
        "RESTORE_TEST_FAILURE")
            subject="❌ Database Restore Test Failed"
            formatted_details="Monthly restore test failed.<br>Error: ${details}<br>Backup integrity may be compromised."
            ;;
        "STORAGE_REPORT")
            subject="📊 Weekly Database Backup Storage Report"
            formatted_details="Weekly storage usage report is attached.<br>Report generated: $(date)<br>Please review storage usage and costs."
            ;;
        *)
            subject="📢 Database Backup Notification"
            formatted_details="${details}"
            ;;
    esac
    
    # Create HTML email body
    local html_body=$(create_html_email "${notification_type}" "${message}" "${formatted_details}")
    
    # Send email
    if send_email_smtp "${NOTIFICATION_EMAIL}" "${subject}" "${html_body}" "${attachment}"; then
        log "Email notification sent successfully to ${NOTIFICATION_EMAIL}"
    else
        log "Failed to send email notification"
        return 1
    fi
}

# Validate arguments
if [[ $# -lt 2 ]]; then
    echo "Usage: $0 <notification_type> <message> [details] [attachment]"
    echo "Example: $0 SUCCESS 'Backup completed' '1.2GB'"
    exit 1
fi

# Run main function
main "$@"
