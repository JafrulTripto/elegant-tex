# Database Backup System

This document provides comprehensive information about the automated database backup system for the Elegant Tex application.

## Overview

The backup system provides automated daily database backups with S3 storage, retention policies, email notifications, and monthly recovery testing. It's implemented as a Docker container that runs alongside your application stack.

## Features

- ✅ **Automated Daily Backups** - Scheduled at 2:00 AM daily
- ✅ **S3 Storage** - Secure cloud storage with organized folder structure
- ✅ **Retention Policies** - Daily (30 days), Weekly (3 months), Monthly (1 year)
- ✅ **Email Notifications** - Success/failure alerts with detailed reports
- ✅ **Monthly Recovery Testing** - Automated backup integrity verification
- ✅ **Health Monitoring** - Continuous system health checks
- ✅ **Compressed Backups** - Gzip compression for storage efficiency
- ✅ **Backup Verification** - File integrity and upload confirmation

## Architecture

### Components

1. **Backup Container** (`backup/`)
   - PostgreSQL client tools for database dumps
   - AWS CLI for S3 operations
   - Cron daemon for scheduling
   - Custom backup scripts

2. **Scripts** (`backup/scripts/`)
   - `backup.sh` - Main backup creation and upload
   - `cleanup.sh` - Retention policy enforcement
   - `restore-test.sh` - Monthly recovery verification
   - `notify.sh` - Email notification system
   - `health-check.sh` - System health monitoring

3. **Docker Integration**
   - Integrated with existing `docker-compose.yml`
   - Shared network with database container
   - Persistent volumes for logs and temporary files

## S3 Storage Structure

```
your-s3-bucket/
└── db-backups/
    ├── daily/
    │   └── 2025/01/29/
    │       └── eleganttex_backup_20250129_020000.sql.gz
    ├── weekly/
    │   └── 2025/week-04/
    │       └── eleganttex_backup_20250129_020000.sql.gz
    ├── monthly/
    │   └── 2025/01/
    │       └── eleganttex_backup_20250129_020000.sql.gz
    └── recovery-tests/
        └── 2025/01/
            └── restore_test_20250129_030000.sql.gz
```

## Configuration

### Environment Variables

Add these variables to your `.env` file:

```bash
# Database Backup Configuration
BACKUP_ENABLED=true
BACKUP_S3_PREFIX=db-backups
BACKUP_RETENTION_DAYS=30
BACKUP_WEEKLY_RETENTION=12
BACKUP_MONTHLY_RETENTION=12
BACKUP_NOTIFICATION_EMAIL=admin@yourdomain.com

# Email SMTP Configuration (for backup notifications)
MAIL_SMTP_SERVER=smtp.gmail.com
MAIL_SMTP_PORT=587
```

### Required AWS Configuration

Ensure these AWS variables are set:

```bash
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
S3_BUCKET_NAME=your-bucket-name
S3_REGION=us-east-1
```

### Email Configuration

For backup notifications, configure SMTP settings:

```bash
MAIL_USERNAME=your-email@gmail.com
MAIL_PASSWORD=your-app-password
MAIL_FROM=Elegant Tex Backup <your-email@gmail.com>
```

## Deployment

### 1. Build and Start Services

```bash
# Build the backup container
docker-compose build backup

# Start all services including backup
docker-compose up -d

# Check backup service status
docker-compose ps backup
```

### 2. Verify Installation

```bash
# Check backup container logs
docker-compose logs backup

# Run manual health check
docker-compose exec backup /backup/scripts/health-check.sh

# Test backup script manually
docker-compose exec backup /backup/scripts/backup.sh
```

### 3. Monitor Logs

```bash
# View backup logs
docker-compose exec backup tail -f /backup/logs/backup.log

# View health check logs
docker-compose exec backup tail -f /backup/logs/health.log

# View all log files
docker-compose exec backup ls -la /backup/logs/
```

## Backup Schedule

| Task | Schedule | Description |
|------|----------|-------------|
| Daily Backup | 2:00 AM daily | Creates compressed database dump and uploads to S3 |
| Weekly Cleanup | 3:00 AM Sundays | Removes old backups according to retention policy |
| Monthly Recovery Test | 3:00 AM 1st of month | Downloads and restores backup to verify integrity |
| Health Check | Every hour | Monitors system health and sends alerts if needed |
| Log Rotation | 4:00 AM daily | Rotates and compresses log files |

## Retention Policy

- **Daily Backups**: Kept for 30 days
- **Weekly Backups**: Kept for 12 weeks (3 months)
- **Monthly Backups**: Kept for 12 months (1 year)
- **Recovery Test Backups**: Kept for 3 months

## Email Notifications

The system sends HTML email notifications for:

- ✅ **Backup Success** - Daily backup completion with file size
- ❌ **Backup Failure** - Backup errors with detailed error information
- 🔍 **Recovery Test Success** - Monthly restore test completion
- ❌ **Recovery Test Failure** - Recovery test failures
- 📊 **Storage Report** - Weekly storage usage summary
- ⚠️ **Health Alerts** - System health issues

## Manual Operations

### Manual Backup

```bash
# Run backup immediately
docker-compose exec backup /backup/scripts/backup.sh

# Run backup with custom timestamp
docker-compose exec backup bash -c "cd /backup && ./scripts/backup.sh"
```

### Manual Restore

```bash
# List available backups
aws s3 ls s3://your-bucket/db-backups/daily/ --recursive

# Download specific backup
aws s3 cp s3://your-bucket/db-backups/daily/2025/01/29/backup.sql.gz ./

# Restore to database (CAUTION: This will overwrite existing data)
gunzip -c backup.sql.gz | docker-compose exec -T db psql -U eleganttex -d eleganttex
```

### Manual Cleanup

```bash
# Run cleanup immediately
docker-compose exec backup /backup/scripts/cleanup.sh

# Generate storage report
docker-compose exec backup /backup/scripts/cleanup.sh
```

### Manual Recovery Test

```bash
# Run recovery test
docker-compose exec backup /backup/scripts/restore-test.sh
```

## Monitoring and Troubleshooting

### Health Checks

The system performs these health checks hourly:

- Database connectivity
- S3 bucket access
- Disk space usage
- Log file sizes
- Recent backup verification
- Cron service status
- Script availability

### Log Files

| Log File | Purpose |
|----------|---------|
| `backup.log` | Daily backup operations |
| `cleanup.log` | Retention policy enforcement |
| `restore-test.log` | Monthly recovery tests |
| `health.log` | System health monitoring |
| `notify.log` | Email notification status |

### Common Issues

#### 1. Backup Failures

**Symptoms**: No recent backups in S3, failure email notifications

**Troubleshooting**:
```bash
# Check backup logs
docker-compose logs backup

# Test database connection
docker-compose exec backup pg_isready -h db -p 5432 -U eleganttex

# Test S3 access
docker-compose exec backup aws s3 ls s3://your-bucket/
```

#### 2. Email Notification Issues

**Symptoms**: No email notifications received

**Troubleshooting**:
```bash
# Check notification logs
docker-compose exec backup tail -f /backup/logs/notify.log

# Test email configuration
docker-compose exec backup /backup/scripts/notify.sh "TEST" "Test message" "Test details"
```

#### 3. Storage Issues

**Symptoms**: Disk space warnings, large log files

**Troubleshooting**:
```bash
# Check disk usage
docker-compose exec backup df -h

# Check log sizes
docker-compose exec backup du -sh /backup/logs/*

# Manual log rotation
docker-compose exec backup logrotate /etc/logrotate.d/backup
```

## Security Considerations

1. **AWS Credentials**: Use IAM roles with minimal required permissions
2. **Database Access**: Backup user should have read-only access
3. **S3 Bucket**: Enable versioning and MFA delete protection
4. **Email**: Use app-specific passwords for Gmail
5. **Network**: Backup container only needs database and S3 access

### Recommended S3 Bucket Policy

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::your-bucket/db-backups/*",
                "arn:aws:s3:::your-bucket"
            ]
        }
    ]
}
```

## Disaster Recovery

### Full Database Restore Procedure

1. **Stop Application Services**:
   ```bash
   docker-compose stop app
   ```

2. **Backup Current Database** (if possible):
   ```bash
   docker-compose exec db pg_dump -U eleganttex eleganttex > current_backup.sql
   ```

3. **Download Backup from S3**:
   ```bash
   aws s3 cp s3://your-bucket/db-backups/daily/2025/01/29/backup.sql.gz ./
   ```

4. **Restore Database**:
   ```bash
   # Drop and recreate database
   docker-compose exec db psql -U eleganttex -d postgres -c "DROP DATABASE IF EXISTS eleganttex;"
   docker-compose exec db psql -U eleganttex -d postgres -c "CREATE DATABASE eleganttex;"
   
   # Restore from backup
   gunzip -c backup.sql.gz | docker-compose exec -T db psql -U eleganttex -d eleganttex
   ```

5. **Restart Application**:
   ```bash
   docker-compose start app
   ```

6. **Verify Restoration**:
   - Check application functionality
   - Verify data integrity
   - Run application tests

## Maintenance

### Regular Tasks

- **Weekly**: Review backup logs and storage reports
- **Monthly**: Verify recovery test results
- **Quarterly**: Review and update retention policies
- **Annually**: Review security settings and access permissions

### Updates

To update the backup system:

1. Pull latest changes
2. Rebuild backup container: `docker-compose build backup`
3. Restart backup service: `docker-compose restart backup`
4. Verify functionality with health check

## Support

For issues with the backup system:

1. Check the troubleshooting section above
2. Review log files for error details
3. Verify configuration settings
4. Test individual components manually

The backup system is designed to be robust and self-healing, with comprehensive logging and monitoring to help identify and resolve issues quickly.
