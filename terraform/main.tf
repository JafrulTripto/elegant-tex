# Elegant-Tex Infrastructure
# Main Terraform configuration for production environment

terraform {
  required_version = ">= 1.0"
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# DigitalOcean Module - Application Server
module "digitalocean" {
  source = "./modules/digitalocean"

  # Droplet Configuration
  droplet_name   = var.droplet_name
  droplet_size   = var.droplet_size
  droplet_region = var.droplet_region
  droplet_image  = var.droplet_image

  # SSH Configuration
  ssh_key_name   = var.ssh_key_name
  ssh_public_key = var.ssh_public_key

  # Project Configuration
  project_name = var.project_name
  environment  = var.environment

  # Monitoring
  enable_monitoring  = var.enable_monitoring
  enable_backups     = var.enable_backups
  enable_reserved_ip = var.enable_reserved_ip
  alert_email        = var.alert_email

  tags = [var.project_name, var.environment]
}

# AWS Module - S3 Storage and CloudFront CDN
module "aws" {
  source = "./modules/aws"

  # S3 Configuration
  storage_bucket_name  = var.storage_bucket_name
  frontend_bucket_name = var.frontend_bucket_name
  aws_region           = var.aws_region

  # CloudFront Configuration
  cloudfront_price_class = var.cloudfront_price_class
  ssl_certificate_arn    = var.ssl_certificate_arn

  # Domain Configuration
  frontend_domain = var.frontend_domain

  # Cost Optimization
  enable_lifecycle_policy    = var.enable_lifecycle_policy
  enable_intelligent_tiering = var.enable_intelligent_tiering
  enable_compression         = var.enable_compression

  # Monitoring
  enable_monitoring = var.enable_monitoring

  # Environment
  environment = var.environment

  tags = var.common_tags
}

# Cloudflare Module - DNS and Security (Optimized)
module "cloudflare" {
  source = "./modules/cloudflare"

  # Zone Configuration
  zone_id     = var.cloudflare_zone_id
  domain_name = var.domain_name

  # DNS Configuration
  api_server_ip     = module.digitalocean.droplet_ip
  cloudfront_domain = module.aws.cloudfront_domain_name

  # Security Configuration
  enable_security_rules = var.enable_security_rules
  enable_rate_limiting  = var.enable_rate_limiting

  # Environment
  environment = var.environment
}
