#!/bin/bash

# Deployment script for Elegant Tex application
# This script pulls the latest Docker image and restarts the containers

# Set variables
DOCKER_IMAGE="tripzin/elegant-tex-v2:latest"
PROJECT_DIR="/root/elegant-tex"  # Update this to your actual project directory

# Print start message
echo "Starting deployment process for Elegant Tex..."
echo "$(date)"

# Pull the latest image
echo "Pulling latest Docker image: $DOCKER_IMAGE"
docker pull $DOCKER_IMAGE

# Check if pull was successful
if [ $? -ne 0 ]; then
  echo "Error: Failed to pull Docker image. Deployment aborted."
  exit 1
fi

# Navigate to project directory
echo "Changing to project directory: $PROJECT_DIR"
cd $PROJECT_DIR || {
  echo "Error: Failed to change to project directory. Deployment aborted."
  exit 1
}

# Stop and remove existing containers
echo "Stopping existing containers..."
docker compose down

# Start containers with the new image
echo "Starting containers with the latest image..."
docker compose up -d

# Check if containers started successfully
if [ $? -ne 0 ]; then
  echo "Error: Failed to start containers. Deployment aborted."
  exit 1
fi

# Clean up old images
echo "Cleaning up old Docker images..."
docker image prune -af

echo "Deployment completed successfully!"
echo "$(date)"
