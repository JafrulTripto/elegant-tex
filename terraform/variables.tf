# Variables for Elegant-Tex Infrastructure

# Project Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "elegant-tex"
}

variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
  default     = "production"
}

variable "common_tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project     = "elegant-tex"
    Environment = "production"
    ManagedBy   = "terraform"
  }
}

# DigitalOcean Configuration
variable "droplet_name" {
  description = "Name of the DigitalOcean droplet"
  type        = string
  default     = "elegant-tex-prod"
}

variable "droplet_size" {
  description = "Size of the DigitalOcean droplet"
  type        = string
  default     = "s-1vcpu-1gb"
}

variable "droplet_region" {
  description = "DigitalOcean region"
  type        = string
  default     = "sgp1"
}

variable "droplet_image" {
  description = "DigitalOcean droplet image"
  type        = string
  default     = "docker-20-04"
}

variable "ssh_key_name" {
  description = "Name for the SSH key"
  type        = string
  default     = "elegant-tex-key"
}

variable "ssh_public_key" {
  description = "SSH public key for droplet access"
  type        = string
  sensitive   = true
}

variable "enable_backups" {
  description = "Enable automated backups"
  type        = bool
  default     = true
}

# AWS Configuration
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

variable "storage_bucket_name" {
  description = "S3 bucket name for file storage"
  type        = string
  default     = "et-prod-storage"
}

variable "frontend_bucket_name" {
  description = "S3 bucket name for frontend hosting"
  type        = string
  default     = "www.elegant-tex.com"
}

variable "cloudfront_price_class" {
  description = "CloudFront price class for cost optimization"
  type        = string
  default     = "PriceClass_100" # US, Canada, Europe only
}

variable "ssl_certificate_arn" {
  description = "ACM certificate ARN for CloudFront"
  type        = string
  default     = ""
}

variable "frontend_domain" {
  description = "Frontend domain name"
  type        = string
  default     = "www.elegant-tex.com"
}

# Cloudflare Configuration
variable "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  type        = string
  sensitive   = true
}

variable "domain_name" {
  description = "Main domain name"
  type        = string
  default     = "elegant-tex.com"
}

variable "enable_security_rules" {
  description = "Enable Cloudflare security rules"
  type        = bool
  default     = true
}

variable "enable_rate_limiting" {
  description = "Enable Cloudflare rate limiting"
  type        = bool
  default     = true
}

# Cost Optimization Settings
variable "enable_s3_intelligent_tiering" {
  description = "Enable S3 Intelligent-Tiering for cost optimization"
  type        = bool
  default     = true
}

variable "s3_lifecycle_enabled" {
  description = "Enable S3 lifecycle policies"
  type        = bool
  default     = true
}

variable "backup_retention_days" {
  description = "Number of days to retain backups"
  type        = number
  default     = 30
}

# Monitoring and Alerting
variable "enable_cost_alerts" {
  description = "Enable cost monitoring alerts"
  type        = bool
  default     = true
}

variable "monthly_budget_limit" {
  description = "Monthly budget limit in USD"
  type        = number
  default     = 50
}

variable "alert_email" {
  description = "Email address for alerts"
  type        = string
  default     = ""
}

# Performance Settings
variable "enable_compression" {
  description = "Enable gzip compression"
  type        = bool
  default     = true
}

variable "cache_ttl_seconds" {
  description = "Default cache TTL in seconds"
  type        = number
  default     = 86400 # 24 hours
}

# Additional AWS Variables
variable "enable_lifecycle_policy" {
  description = "Enable S3 lifecycle policies for cost optimization"
  type        = bool
  default     = true
}

variable "enable_intelligent_tiering" {
  description = "Enable S3 Intelligent-Tiering for cost optimization"
  type        = bool
  default     = true
}

variable "enable_monitoring" {
  description = "Enable monitoring and alerting"
  type        = bool
  default     = true
}

# Additional DigitalOcean Variables
variable "enable_reserved_ip" {
  description = "Enable reserved IP for the droplet"
  type        = bool
  default     = false
}


