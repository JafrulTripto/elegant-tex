# Terraform Variables Example File
# Copy this file to terraform.tfvars and fill in your actual values

# Project Configuration
project_name = "elegant-tex"
environment  = "production"

# DigitalOcean Configuration
droplet_name   = "elegant-tex-prod"
droplet_size   = "s-1vcpu-2gb"  # Cost-optimized for 60 concurrent users
droplet_region = "sgp1"         # Singapore region
droplet_image  = "docker-20-04"

# SSH Configuration (REQUIRED)
ssh_key_name   = "elegant-tex-key"
ssh_public_key = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDevQ5/GZtiS9ZLlBGxBw2ABgySAicMB0ULiqCOtIe/zg+NTL8wHC+hdD8GMzOvma3vBaMuZDCD5M9cOzK398UmAhpDiQ//LMJlAnGYX0+SwEjz0G73r3QYArBHU7wtJEn2mg4duGR+QntHPj8HGfHFMgKo97dFFx9C0ZrtjBXzN/YKGIzThW8OqcTwyOKzWucU5ghVtrui7jwFsePCHiV/CO2CWACr44BUoAhw+KI/NUjfdL4T4p/bQuwk/Bi9qJw3Gs8nMDZbZSZDIsBHnYVTo1gl0Dn9wUv+OfAwmcdfPikpAsqn3zfJyXAM/qo2CUZxIjC5R6Qy6o45gwSMyKrBfttGKUloxtYX3opAc4T1fP4ukNP4bmQExFNl4fFHutrwYp3cmvzqPJ8UtFE3MEgriyl0tEo226ZK44FGn4r56C1Ph70Fd6hIj+pTO+9OG/Vd6X0PtJl+ry9hO5Dee6jSq/L9jhZ4I15selZNtizp6NCmhI9NHCaSMGDSyRvkfrlhz2AWx7Fn/UEcZ394TRZu+OEg3o3I+urlG96mIWSWXUMjK7YkeARs1uWZjWhEfSqrs8xThBVxeQvhxB8K4/oDMv5Be9Gp8UoSkeQtxztEQZjF4FLxYCB0uswp/Nzc2MlZ+MWkjhGgRvjGDL4eDUX0i3CVof5Kfv7pR6YHY69obw== jafrultripto@gmail.com"

# AWS Configuration
aws_region           = "ap-southeast-1"  # Singapore region
storage_bucket_name  = "et-prod-storage"
frontend_bucket_name = "web.elegant-tex.com"

# CloudFront Configuration
cloudfront_price_class = "PriceClass_100"  # US, Canada, Europe only (cost-optimized)
ssl_certificate_arn   = ""  # Leave empty to use CloudFront default certificate
frontend_domain       = "web.elegant-tex.com"


# Cloudflare Configuration (REQUIRED)
cloudflare_zone_id = "56e4093afcb86c6479de46650ccd826c"
domain_name        = "elegant-tex.com"

# Security Settings
enable_security_rules = true
enable_rate_limiting  = true

# Cost Optimization Settings
enable_s3_intelligent_tiering = true
s3_lifecycle_enabled         = true
enable_lifecycle_policy      = true
enable_intelligent_tiering   = true
backup_retention_days        = 30

# Monitoring and Alerting
enable_monitoring    = true
enable_backups      = true
enable_cost_alerts  = true
monthly_budget_limit = 50
alert_email         = "jafrultripto@gmail.com"

# Performance Settings
enable_compression = true
cache_ttl_seconds  = 86400  # 24 hours

# Optional Features (disabled by default for cost optimization)
enable_reserved_ip = false  # Enable for production stability (additional cost)

# Common Tags
common_tags = {
  Project     = "elegant-tex"
  Environment = "production"
  ManagedBy   = "terraform"
  Owner       = "Jafrul Tripto"
  CostCenter  = "engineering"
}
