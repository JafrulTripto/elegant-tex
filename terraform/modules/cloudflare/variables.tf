# Variables for Cloudflare Module

# Zone Configuration
variable "zone_id" {
  description = "Cloudflare zone ID"
  type        = string
}

variable "domain_name" {
  description = "Main domain name"
  type        = string
}

# DNS Configuration
variable "api_server_ip" {
  description = "IP address of the API server"
  type        = string
}

variable "cloudfront_domain" {
  description = "CloudFront distribution domain name"
  type        = string
}

# Security Configuration
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

variable "enable_waf_rules" {
  description = "Enable custom WAF rules"
  type        = bool
  default     = false
}

variable "admin_ip" {
  description = "Admin IP address for WAF rules"
  type        = string
  default     = ""
}

# Performance Configuration
variable "enable_api_caching" {
  description = "Enable caching for API static assets"
  type        = bool
  default     = true
}

# Geographic Configuration
variable "allowed_countries" {
  description = "List of allowed country codes"
  type        = list(string)
  default     = []
}

# SSL Configuration
variable "create_origin_cert" {
  description = "Create Cloudflare origin certificate"
  type        = bool
  default     = false
}

variable "origin_cert_csr" {
  description = "Certificate Signing Request for origin certificate"
  type        = string
  default     = ""
}

# Load Balancer Configuration
variable "enable_load_balancer" {
  description = "Enable Cloudflare load balancer"
  type        = bool
  default     = false
}

variable "health_check_id" {
  description = "Health check ID for load balancer"
  type        = string
  default     = ""
}

variable "account_id" {
  description = "Cloudflare account ID"
  type        = string
  default     = ""
}

# Logging Configuration
variable "enable_logpush" {
  description = "Enable Cloudflare logpush"
  type        = bool
  default     = false
}

variable "logpush_destination" {
  description = "Logpush destination configuration"
  type        = string
  default     = ""
}

# General Configuration
variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
}
