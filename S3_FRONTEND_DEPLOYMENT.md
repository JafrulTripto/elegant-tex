# S3 Frontend Deployment Guide

This guide explains how to deploy the Elegant-Tex frontend to an AWS S3 bucket using GitHub Actions.

## Overview

The frontend deployment is automated using GitHub Actions. When changes are pushed to the `main` branch in the `frontend` directory, the workflow will:

1. Build the frontend application
2. Deploy the built files to an AWS S3 bucket

## Prerequisites

Before using this deployment automation, ensure you have:

1. An AWS S3 bucket configured for static website hosting
2. AWS IAM credentials with permissions to write to the S3 bucket
3. GitHub repository secrets configured (see below)

## GitHub Secrets Configuration

Add the following secrets to your GitHub repository:

1. Go to your GitHub repository
2. Click on **Settings**
3. In the left sidebar, select **Secrets and variables** → **Actions**
4. Click **New repository secret** and add each of the following:

| Secret Name | Description |
|-------------|-------------|
| `AWS_ACCESS_KEY_ID` | Your AWS access key |
| `AWS_SECRET_ACCESS_KEY` | Your AWS secret key |
| `AWS_REGION` | The AWS region where your bucket is located (e.g., `us-east-1`) |
| `AWS_S3_BUCKET` | Your S3 bucket name |
| `VITE_API_BASE_URL` | The URL of your production API (e.g., `https://api.eleganttex.com/api/v1`) |

## S3 Bucket Configuration

Ensure your S3 bucket is configured for static website hosting:

1. Open the AWS S3 console
2. Select your bucket
3. Go to the **Properties** tab
4. Scroll down to **Static website hosting** and click **Edit**
5. Select **Enable**
6. Set **Index document** to `index.html`
7. Set **Error document** to `index.html` (for SPA routing)
8. Click **Save changes**

Also, configure the bucket policy to allow public access to your website:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::YOUR-BUCKET-NAME/*"
        }
    ]
}
```

Replace `YOUR-BUCKET-NAME` with your actual bucket name.

## Environment Variables

The frontend application uses environment variables to configure various settings. These are managed through `.env` files:

- `.env.development`: Used during local development (`npm run dev`)
- `.env.production`: Used during production builds (`npm run build`)

In the GitHub Actions workflow, the production environment variables are set from GitHub secrets.

## Local Development

For local development, the `.env.development` file is used. You can modify this file to change settings for your local environment.

## Manual Deployment

If you need to deploy manually:

1. Set up your AWS credentials locally
2. Build the frontend:
   ```bash
   cd frontend
   npm run build
   ```
3. Deploy to S3:
   ```bash
   aws s3 sync dist/ s3://YOUR-BUCKET-NAME --delete
   ```

## Troubleshooting

If you encounter issues with the deployment:

1. Check the GitHub Actions logs for any errors
2. Verify that all required secrets are correctly set
3. Ensure your AWS credentials have the necessary permissions
4. Check that your S3 bucket is correctly configured for static website hosting

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [AWS S3 Static Website Hosting Documentation](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
