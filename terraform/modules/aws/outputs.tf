# Outputs for AWS Module

# S3 Storage Bucket Outputs
output "storage_bucket_id" {
  description = "ID of the S3 storage bucket"
  value       = aws_s3_bucket.storage.id
}

output "storage_bucket_name" {
  description = "Name of the S3 storage bucket"
  value       = aws_s3_bucket.storage.bucket
}

output "storage_bucket_arn" {
  description = "ARN of the S3 storage bucket"
  value       = aws_s3_bucket.storage.arn
}

output "storage_bucket_domain_name" {
  description = "Domain name of the S3 storage bucket"
  value       = aws_s3_bucket.storage.bucket_domain_name
}

output "storage_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 storage bucket"
  value       = aws_s3_bucket.storage.bucket_regional_domain_name
}

# S3 Frontend Bucket Outputs
output "frontend_bucket_id" {
  description = "ID of the S3 frontend bucket"
  value       = aws_s3_bucket.frontend.id
}

output "frontend_bucket_name" {
  description = "Name of the S3 frontend bucket"
  value       = aws_s3_bucket.frontend.bucket
}

output "frontend_bucket_arn" {
  description = "ARN of the S3 frontend bucket"
  value       = aws_s3_bucket.frontend.arn
}

output "frontend_bucket_domain_name" {
  description = "Domain name of the S3 frontend bucket"
  value       = aws_s3_bucket.frontend.bucket_domain_name
}

output "frontend_bucket_regional_domain_name" {
  description = "Regional domain name of the S3 frontend bucket"
  value       = aws_s3_bucket.frontend.bucket_regional_domain_name
}

output "frontend_bucket_website_endpoint" {
  description = "Website endpoint of the S3 frontend bucket"
  value       = aws_s3_bucket_website_configuration.frontend.website_endpoint
}

output "frontend_bucket_website_domain" {
  description = "Website domain of the S3 frontend bucket"
  value       = aws_s3_bucket_website_configuration.frontend.website_domain
}

# CloudFront Distribution Outputs
output "cloudfront_distribution_id" {
  description = "ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.id
}

output "cloudfront_distribution_arn" {
  description = "ARN of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.arn
}

output "cloudfront_domain_name" {
  description = "Domain name of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.domain_name
}

output "cloudfront_hosted_zone_id" {
  description = "Hosted zone ID of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.hosted_zone_id
}

output "cloudfront_status" {
  description = "Status of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.status
}

output "cloudfront_etag" {
  description = "ETag of the CloudFront distribution"
  value       = aws_cloudfront_distribution.frontend.etag
}

# Origin Access Identity Outputs
output "origin_access_identity_id" {
  description = "ID of the CloudFront Origin Access Identity"
  value       = var.create_oai ? aws_cloudfront_origin_access_identity.main[0].id : var.existing_oai_id
}

output "origin_access_identity_iam_arn" {
  description = "IAM ARN of the CloudFront Origin Access Identity"
  value       = var.create_oai ? aws_cloudfront_origin_access_identity.main[0].iam_arn : data.aws_cloudfront_origin_access_identity.main[0].iam_arn
}

output "origin_access_identity_cloudfront_access_identity_path" {
  description = "CloudFront access identity path"
  value       = var.create_oai ? aws_cloudfront_origin_access_identity.main[0].cloudfront_access_identity_path : data.aws_cloudfront_origin_access_identity.main[0].cloudfront_access_identity_path
}

# Cost Optimization Features
output "intelligent_tiering_enabled" {
  description = "Whether S3 Intelligent-Tiering is enabled"
  value       = var.enable_intelligent_tiering
}

output "lifecycle_policy_enabled" {
  description = "Whether S3 lifecycle policies are enabled"
  value       = var.enable_lifecycle_policy
}

output "cloudfront_price_class" {
  description = "CloudFront price class being used"
  value       = var.cloudfront_price_class
}

# Security Features
output "storage_bucket_encryption_enabled" {
  description = "Whether S3 storage bucket encryption is enabled"
  value       = true
}

output "frontend_bucket_public_access_blocked" {
  description = "Whether S3 frontend bucket public access is blocked"
  value       = true
}

output "cloudfront_compression_enabled" {
  description = "Whether CloudFront compression is enabled"
  value       = var.enable_compression
}

# Monitoring Features
output "cloudwatch_monitoring_enabled" {
  description = "Whether CloudWatch monitoring is enabled"
  value       = var.enable_monitoring
}

output "cloudfront_error_alarm_name" {
  description = "Name of the CloudFront error rate alarm"
  value       = var.enable_monitoring ? aws_cloudwatch_metric_alarm.cloudfront_error_rate[0].alarm_name : null
}

# URLs and Endpoints
output "frontend_urls" {
  description = "Frontend access URLs"
  value = {
    cloudfront_url = "https://${aws_cloudfront_distribution.frontend.domain_name}"
    custom_domain  = var.frontend_domain != "" ? "https://${var.frontend_domain}" : null
    s3_website_url = "http://${aws_s3_bucket_website_configuration.frontend.website_endpoint}"
  }
}

output "storage_access_info" {
  description = "Storage bucket access information"
  value = {
    bucket_name = aws_s3_bucket.storage.bucket
    region      = data.aws_region.current.name
    arn         = aws_s3_bucket.storage.arn
  }
}

# Configuration Summary
output "configuration_summary" {
  description = "Summary of AWS module configuration"
  value = {
    storage_bucket = {
      name                    = aws_s3_bucket.storage.bucket
      versioning_enabled      = true
      encryption_enabled      = true
      intelligent_tiering     = var.enable_intelligent_tiering
      lifecycle_policy        = var.enable_lifecycle_policy
    }
    frontend_bucket = {
      name                    = aws_s3_bucket.frontend.bucket
      website_hosting_enabled = true
      cloudfront_enabled      = true
    }
    cloudfront = {
      distribution_id   = aws_cloudfront_distribution.frontend.id
      custom_domain     = var.frontend_domain
      price_class       = var.cloudfront_price_class
      compression       = var.enable_compression
      ssl_certificate   = var.ssl_certificate_arn != "" ? "Custom" : "CloudFront Default"
    }
  }
}
