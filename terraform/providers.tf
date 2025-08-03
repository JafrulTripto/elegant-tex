# Provider configurations for Elegant-Tex Infrastructure

# DigitalOcean Provider
provider "digitalocean" {
  # Token will be provided via DIGITALOCEAN_TOKEN environment variable
}

# AWS Provider
provider "aws" {
  region = var.aws_region
  # Credentials will be provided via AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables
  
  default_tags {
    tags = var.common_tags
  }
}

# Cloudflare Provider
provider "cloudflare" {
  # API token will be provided via CLOUDFLARE_API_TOKEN environment variable
}
