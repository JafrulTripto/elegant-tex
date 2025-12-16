#!/bin/bash

# Script to generate docker-compose.yml dynamically based on SPRING_PROFILES_ACTIVE
# Usage: ./generate-compose.sh [--local] > docker-compose.generated.yml
#        Or set in Makefile to pipe into docker compose
# Options:
#   --local    Generate compose for local dev (no app/nginx, only infrastructure)

set -e

# Check for --local flag
LOCAL_MODE=false
if [ "$1" = "--local" ]; then
  LOCAL_MODE=true
fi

# Load .env
if [ ! -f .env ]; then
  echo "❌ Error: .env file not found!" >&2
  exit 1
fi

# Read SPRING_PROFILES_ACTIVE from .env
PROFILE=$(grep "^SPRING_PROFILES_ACTIVE=" .env | cut -d'=' -f2 | tr -d ' ')

if [ -z "$PROFILE" ]; then
  echo "❌ Error: SPRING_PROFILES_ACTIVE not set in .env" >&2
  exit 1
fi

# Determine nginx config and other settings based on profile
if [ "$PROFILE" = "prod" ]; then
  NGINX_CONFIG="./.docker/nginx/nginx.prod.conf"
  WORKER_CONNECTIONS=2048
  APP_IMAGE_MODE="image"
  # Update this to your Docker Hub image name
  APP_IMAGE_NAME="${DOCKER_IMAGE_NAME:-tripzin/elegant-tex-v2:latest}"
else
  NGINX_CONFIG="./.docker/nginx/nginx.dev.conf"
  WORKER_CONNECTIONS=1024
  APP_IMAGE_MODE="build"
  APP_IMAGE_NAME=""
fi

# Verify nginx config exists
if [ ! -f "$NGINX_CONFIG" ]; then
  echo "❌ Error: Nginx config not found: $NGINX_CONFIG" >&2
  exit 1
fi

# Generate docker-compose.yml with environment-specific settings
cat << 'EOF'
services:
  db:
    image: postgres:15-alpine
    networks:
      - elegant-tex-network
    ports:
      - "5432:5432"
    environment:
      - POSTGRES_USER=${DATABASE_USERNAME}
      - POSTGRES_PASSWORD=${DATABASE_PASSWORD}
      - POSTGRES_DB=${POSTGRES_DB}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

EOF

# Only generate app and nginx services if NOT in local mode
if [ "$LOCAL_MODE" = false ]; then
  # Generate app service based on environment
  if [ "$APP_IMAGE_MODE" = "image" ]; then
    cat << EOF
  app:
    image: ${APP_IMAGE_NAME}
    networks:
      - elegant-tex-network
    env_file:
      - .env
    environment:
EOF
  else
    cat << 'EOF'
  app:
    build:
      context: .
      dockerfile: Dockerfile
    networks:
      - elegant-tex-network
    env_file:
      - .env
    environment:
EOF
  fi

  cat << 'EOF'
      - SPRING_PROFILES_ACTIVE=${SPRING_PROFILES_ACTIVE}
      - DATABASE_URL=${DATABASE_URL}
      - DATABASE_USERNAME=${DATABASE_USERNAME}
      - DATABASE_PASSWORD=${DATABASE_PASSWORD}
      - JWT_SECRET=${JWT_SECRET}
      - MAIL_USERNAME=${MAIL_USERNAME}
      - MAIL_PASSWORD=${MAIL_PASSWORD}
      - MAIL_FROM=${MAIL_FROM}
      - SERVER_PORT=${SERVER_PORT}
      - APP_FRONTEND_URL=${APP_FRONTEND_URL}
      - CORS_ALLOWED_ORIGINS=${CORS_ALLOWED_ORIGINS}
    volumes:
      - ./logs:/app/logs
    depends_on:
      - db
    restart: unless-stopped

  nginx:
    image: nginx:latest
    networks:
      - elegant-tex-network
    ports:
      - "80:80"
      - "443:443"
    volumes:
EOF

  # Add the dynamically selected nginx config
  cat << EOF
      - ${NGINX_CONFIG}:/etc/nginx/nginx.conf:ro
      - ./.docker/certs:/etc/nginx/certs:ro
    depends_on:
      - app
    restart: unless-stopped

EOF
fi

cat << 'EOF'
  prometheus:
    image: prom/prometheus:latest
    networks:
      - elegant-tex-network
    ports:
      - "9090:9090"
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--web.enable-lifecycle'
EOF

# Only add depends_on: app if not in local mode
if [ "$LOCAL_MODE" = false ]; then
  cat << 'EOF'
    depends_on:
      - app
EOF
fi

cat << 'EOF'
    restart: unless-stopped

  grafana:
    image: grafana/grafana:latest
    networks:
      - elegant-tex-network
    ports:
      - "3000:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
    environment:
      - GF_SECURITY_ADMIN_USER=admin
      - GF_SECURITY_ADMIN_PASSWORD=admin
      - GF_USERS_ALLOW_SIGN_UP=false
    depends_on:
      - prometheus
    restart: unless-stopped

  loki:
    image: grafana/loki:2.9.8
    networks:
      - elegant-tex-network
    ports:
      - "3100:3100"
    command: ["-config.file=/etc/loki/local-config.yaml"]
    volumes:
      - ./loki/config.yaml:/etc/loki/local-config.yaml:ro
      - loki_data:/loki
    restart: unless-stopped

  promtail:
    image: grafana/promtail:2.9.8
    networks:
      - elegant-tex-network
    command: ["-config.file=/etc/promtail/config.yml"]
    volumes:
      - ./promtail/config.yml:/etc/promtail/config.yml:ro
      - ./logs:/var/log/elegant-tex:ro
    depends_on:
      - loki
    restart: unless-stopped

volumes:
  postgres_data:
  prometheus_data:
  grafana_data:
  backup_logs:
  backup_temp:
  loki_data:

networks:
  elegant-tex-network:
    driver: bridge
EOF

# Print info to stderr so stdout is pure YAML
echo "" >&2
if [ "$LOCAL_MODE" = true ]; then
  echo "✅ Generated docker-compose for LOCAL DEVELOPMENT" >&2
  echo "🔧 Infrastructure only (no app/nginx)" >&2
  echo "💡 Run Spring Boot app locally with: ./mvnw spring-boot:run" >&2
  echo "📊 Database at: localhost:5432" >&2
else
  echo "✅ Generated docker-compose for environment: $PROFILE" >&2
  echo "📦 Using nginx config: $NGINX_CONFIG" >&2
fi
