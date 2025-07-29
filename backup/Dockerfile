FROM postgres:15-alpine

# Install required packages
RUN apk add --no-cache \
    aws-cli \
    curl \
    bash \
    dcron \
    tzdata \
    gzip \
    tar

# Set timezone
ENV TZ=Asia/Kuala_Lumpur
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Create backup user and directories
RUN adduser -D -s /bin/bash backup
RUN mkdir -p /backup/scripts /backup/temp /backup/logs
RUN chown -R backup:backup /backup

# Copy backup scripts
COPY scripts/ /backup/scripts/
RUN chmod +x /backup/scripts/*.sh
RUN chown -R backup:backup /backup/scripts

# Copy crontab
COPY crontab /etc/crontabs/backup
RUN chown backup:backup /etc/crontabs/backup

# Create log rotation
RUN echo "*/backup/logs/*.log {" > /etc/logrotate.d/backup && \
    echo "    daily" >> /etc/logrotate.d/backup && \
    echo "    rotate 7" >> /etc/logrotate.d/backup && \
    echo "    compress" >> /etc/logrotate.d/backup && \
    echo "    missingok" >> /etc/logrotate.d/backup && \
    echo "    notifempty" >> /etc/logrotate.d/backup && \
    echo "}" >> /etc/logrotate.d/backup

WORKDIR /backup

# Health check
HEALTHCHECK --interval=1h --timeout=30s --start-period=5m --retries=3 \
    CMD /backup/scripts/health-check.sh

# Start cron daemon
CMD ["crond", "-f", "-d", "8"]
