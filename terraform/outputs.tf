# Outputs for Elegant-Tex Infrastructure

# DigitalOcean Outputs
output "droplet_ip" {
  description = "Public IP address of the DigitalOcean droplet"
  value       = module.digitalocean.droplet_ip
}

output "droplet_id" {
  description = "ID of the DigitalOcean droplet"
  value       = module.digitalocean.droplet_id
}

output "droplet_urn" {
  description = "URN of the DigitalOcean droplet"
  value       = module.digitalocean.droplet_urn
}

output "ssh_key_fingerprint" {
  description = "Fingerprint of the SSH key"
  value       = module.digitalocean.ssh_key_fingerprint
}

# AWS Outputs
output "storage_bucket_name" {
  description = "Name of the S3 storage bucket"
  value       = module.aws.storage_bucket_name
}

output "storage_bucket_arn" {
  description = "ARN of the S3 storage bucket"
  value       = module.aws.storage_bucket_arn
}

output "frontend_bucket_name" {
  description = "Name of the S3 frontend bucket"
  value       = module.aws.frontend_bucket_name
}

output "frontend_bucket_website_endpoint" {
  description = "Website endpoint of the frontend bucket"
  value       = module.aws.frontend_bucket_website_endpoint
}

output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = module.aws.cloudfront_distribution_id
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = module.aws.cloudfront_domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  value       = module.aws.cloudfront_hosted_zone_id
}

# Cloudflare Outputs
output "cloudflare_zone_id" {
  description = "Cloudflare zone ID"
  value       = module.cloudflare.zone_id
}

output "api_dns_record_id" {
  description = "ID of the API DNS record"
  value       = module.cloudflare.api_dns_record_id
}

output "frontend_dns_record_id" {
  description = "ID of the frontend DNS record"
  value       = module.cloudflare.frontend_dns_record_id
}

# Infrastructure Summary
output "infrastructure_summary" {
  description = "Summary of deployed infrastructure"
  value = {
    droplet = {
      ip     = module.digitalocean.droplet_ip
      region = var.droplet_region
      size   = var.droplet_size
    }
    storage = {
      bucket_name = module.aws.storage_bucket_name
      region      = var.aws_region
    }
    frontend = {
      bucket_name    = module.aws.frontend_bucket_name
      cloudfront_url = module.aws.cloudfront_domain_name
      custom_domain  = var.frontend_domain
    }
    dns = {
      domain     = var.domain_name
      zone_id    = var.cloudflare_zone_id
      api_ip     = module.digitalocean.droplet_ip
    }
  }
}

# Cost Optimization Info
output "cost_optimization_features" {
  description = "Enabled cost optimization features"
  value = {
    s3_intelligent_tiering = var.enable_s3_intelligent_tiering
    s3_lifecycle_policies  = var.s3_lifecycle_enabled
    cloudfront_price_class = var.cloudfront_price_class
    backup_retention_days  = var.backup_retention_days
  }
}

# Security Features
output "security_features" {
  description = "Enabled security features"
  value = {
    cloudflare_security_rules = var.enable_security_rules
    cloudflare_rate_limiting  = var.enable_rate_limiting
    droplet_firewall         = true
    s3_bucket_encryption     = true
    cloudfront_ssl           = true
  }
}

# Monitoring and Alerts
output "monitoring_features" {
  description = "Enabled monitoring features"
  value = {
    digitalocean_monitoring = var.enable_monitoring
    automated_backups      = var.enable_backups
    cost_alerts           = var.enable_cost_alerts
    monthly_budget_limit  = var.monthly_budget_limit
  }
}
