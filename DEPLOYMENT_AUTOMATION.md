# Deployment Automation Guide

This guide explains how to use the automated deployment options for the Elegant Tex application.

## Option 1: GitHub Actions (CI/CD Pipeline)

The GitHub Actions workflow automatically builds and deploys your application whenever you push changes to the main branch.

### Prerequisites

1. Set up the following secrets in your GitHub repository:
   - `DOCKER_USERNAME`: Your Docker Hub username
   - `DOCKER_PASSWORD`: Your Docker Hub password
   - `DIGITAL_OCEAN_IP`: Your Digital Ocean droplet's IP address
   - `SSH_PRIVATE_KEY`: Your SSH private key for authentication

### How to Set Up GitHub Secrets

1. Go to your GitHub repository
2. Click on **Settings**
3. In the left sidebar, select **Secrets and variables** → **Actions**
4. Click **New repository secret** and add each of the required secrets

### How It Works

1. When you push changes to the main branch, the workflow:
   - Builds a new Docker image
   - Pushes it to Docker Hub
   - SSHs into your Digital Ocean droplet
   - Pulls the latest image and restarts the containers

### Customization

You may need to modify the `.github/workflows/deploy.yml` file:
- Change the branch name if you're not using `main`
- Update the Docker image name/tag if needed
- Update the project directory path on your server (currently set to `/root/elegant-tex`)

## Option 2: Manual Deployment Script

The `deploy.sh` script allows you to manually trigger deployments from your server.

### Setup

1. Upload the `deploy.sh` script to your Digital Ocean droplet
2. Make it executable:
   ```bash
   chmod +x deploy.sh
   ```
3. Edit the script to update:
   - `DOCKER_IMAGE`: Your Docker image name (currently set to `tripzin/elegant-tex-v2:latest`)
   - `PROJECT_DIR`: The path to your project on the server (currently set to `/root/elegant-tex`)

### Usage

Run the script manually:
```bash
./deploy.sh
```

### Automation with Cron (Optional)

To automatically run the script at regular intervals:

1. Open the crontab editor:
   ```bash
   crontab -e
   ```

2. Add a line to run the script (e.g., every hour):
   ```
   0 * * * * /path/to/deploy.sh >> /var/log/deploy.log 2>&1
   ```

## Workflow for Making Changes

1. Make changes to your local codebase
2. Commit and push to GitHub
3. If using GitHub Actions:
   - The workflow will automatically deploy your changes
4. If using manual deployment:
   - SSH into your server
   - Run the deployment script

## Troubleshooting

- Check GitHub Actions logs for CI/CD issues
- Review the deployment script output for manual deployment issues
- Verify Docker Hub credentials and SSH access
