# Variables for AWS Module

# S3 Configuration
variable "storage_bucket_name" {
  description = "Name of the S3 bucket for file storage"
  type        = string
}

variable "frontend_bucket_name" {
  description = "Name of the S3 bucket for frontend hosting"
  type        = string
}

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "ap-southeast-1"
}

# CloudFront Configuration
variable "frontend_domain" {
  description = "Custom domain for the frontend"
  type        = string
  default     = ""
}

variable "cloudfront_price_class" {
  description = "CloudFront price class for cost optimization"
  type        = string
  default     = "PriceClass_100"
  validation {
    condition = contains([
      "PriceClass_All",
      "PriceClass_200",
      "PriceClass_100"
    ], var.cloudfront_price_class)
    error_message = "Price class must be PriceClass_All, PriceClass_200, or PriceClass_100."
  }
}

variable "ssl_certificate_arn" {
  description = "ARN of the SSL certificate for CloudFront"
  type        = string
  default     = ""
}

# Origin Access Identity Configuration
variable "create_oai" {
  description = "Whether to create a new Origin Access Identity"
  type        = bool
  default     = true
}

variable "existing_oai_id" {
  description = "ID of existing Origin Access Identity (if not creating new)"
  type        = string
  default     = ""
}

# Cost Optimization Settings
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

# Performance Settings
variable "enable_compression" {
  description = "Enable gzip compression in CloudFront"
  type        = bool
  default     = true
}

variable "cache_ttl_seconds" {
  description = "Default cache TTL in seconds"
  type        = number
  default     = 86400
}

# Monitoring and Alerting
variable "enable_monitoring" {
  description = "Enable CloudWatch monitoring and alarms"
  type        = bool
  default     = true
}

variable "sns_topic_arn" {
  description = "SNS topic ARN for alerts"
  type        = string
  default     = ""
}

# General Configuration
variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
