# AWS Module - S3 Storage and CloudFront CDN

terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

# Data source for current AWS region
data "aws_region" "current" {}

# Data source for CloudFront Origin Access Identity
data "aws_cloudfront_origin_access_identity" "main" {
  count = var.create_oai ? 0 : 1
  id    = var.existing_oai_id
}

# CloudFront Origin Access Identity (if creating new)
resource "aws_cloudfront_origin_access_identity" "main" {
  count   = var.create_oai ? 1 : 0
  comment = "OAI for ${var.frontend_domain}"
}

# S3 Bucket for file storage (private)
resource "aws_s3_bucket" "storage" {
  bucket = var.storage_bucket_name

  tags = merge(var.tags, {
    Name        = var.storage_bucket_name
    Purpose     = "File Storage"
    Environment = var.environment
  })
}

# S3 Bucket versioning for storage
resource "aws_s3_bucket_versioning" "storage" {
  bucket = aws_s3_bucket.storage.id
  versioning_configuration {
    status = "Enabled"
  }
}

# S3 Bucket encryption for storage
resource "aws_s3_bucket_server_side_encryption_configuration" "storage" {
  bucket = aws_s3_bucket.storage.id

  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

# S3 Bucket public access block for storage
resource "aws_s3_bucket_public_access_block" "storage" {
  bucket = aws_s3_bucket.storage.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket for frontend hosting
resource "aws_s3_bucket" "frontend" {
  bucket = var.frontend_bucket_name

  tags = merge(var.tags, {
    Name        = var.frontend_bucket_name
    Purpose     = "Frontend Hosting"
    Environment = var.environment
  })
}

# S3 Bucket website configuration for frontend
resource "aws_s3_bucket_website_configuration" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"  # SPA routing
  }
}

# S3 Bucket public access block for frontend
resource "aws_s3_bucket_public_access_block" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# S3 Bucket policy for CloudFront access to frontend
resource "aws_s3_bucket_policy" "frontend" {
  bucket = aws_s3_bucket.frontend.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid    = "AllowCloudFrontAccess"
        Effect = "Allow"
        Principal = {
          AWS = var.create_oai ? aws_cloudfront_origin_access_identity.main[0].iam_arn : data.aws_cloudfront_origin_access_identity.main[0].iam_arn
        }
        Action   = "s3:GetObject"
        Resource = "${aws_s3_bucket.frontend.arn}/*"
      }
    ]
  })
}

# CloudFront Distribution for frontend
resource "aws_cloudfront_distribution" "frontend" {
  origin {
    domain_name = aws_s3_bucket.frontend.bucket_regional_domain_name
    origin_id   = "S3-${aws_s3_bucket.frontend.id}"

    s3_origin_config {
      origin_access_identity = var.create_oai ? aws_cloudfront_origin_access_identity.main[0].cloudfront_access_identity_path : data.aws_cloudfront_origin_access_identity.main[0].cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  comment             = "CloudFront distribution for ${var.frontend_domain}"
  default_root_object = "index.html"

  # Aliases (custom domains)
  aliases = var.frontend_domain != "" ? [var.frontend_domain] : []

  # Default cache behavior
  default_cache_behavior {
    allowed_methods        = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods         = ["GET", "HEAD"]
    target_origin_id       = "S3-${aws_s3_bucket.frontend.id}"
    compress               = var.enable_compression
    viewer_protocol_policy = "redirect-to-https"

    # Use managed cache policy for optimized caching
    cache_policy_id = "4135ea2d-6df8-44a3-9df3-4b5a84be39ad" # Managed-CachingOptimized

    # Use managed origin request policy
    origin_request_policy_id = "88a5eaf4-2fd4-4709-b370-b4c650ea3fcf" # Managed-CORS-S3Origin
  }

  # Custom error responses for SPA
  custom_error_response {
    error_code         = 403
    response_code      = 200
    response_page_path = "/index.html"
  }

  custom_error_response {
    error_code         = 404
    response_code      = 200
    response_page_path = "/index.html"
  }

  # Price class for cost optimization
  price_class = var.cloudfront_price_class

  # Geographic restrictions
  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  # SSL certificate configuration
  viewer_certificate {
    acm_certificate_arn            = "arn:aws:acm:us-east-1:981360964035:certificate/ba59f9a6-851b-40d0-bec8-d9e090c9a0c8"
    ssl_support_method             = "sni-only"
    minimum_protocol_version       = "TLSv1.2_2021"
  }


  tags = merge(var.tags, {
    Name        = "${var.frontend_domain}-cloudfront"
    Environment = var.environment
  })
}

resource "aws_s3_bucket_lifecycle_configuration" "storage" {
  count  = var.enable_lifecycle_policy ? 1 : 0
  bucket = aws_s3_bucket.storage.id

  rule {
    id     = "storage_lifecycle"
    status = "Enabled"

    filter {
      prefix = ""
    }

    transition {
      days          = 0
      storage_class = "INTELLIGENT_TIERING"
    }

    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }

    noncurrent_version_expiration {
      noncurrent_days = 90
    }
  }
}

# S3 Intelligent-Tiering configuration
resource "aws_s3_bucket_intelligent_tiering_configuration" "storage" {
  count  = var.enable_intelligent_tiering ? 1 : 0
  bucket = aws_s3_bucket.storage.id
  name   = "EntireBucket"

  status = "Enabled"

  tiering {
    access_tier = "ARCHIVE_ACCESS"
    days        = 90
  }

  tiering {
    access_tier = "DEEP_ARCHIVE_ACCESS"
    days        = 180
  }
}

# CloudWatch alarm for high CloudFront error rate
resource "aws_cloudwatch_metric_alarm" "cloudfront_error_rate" {
  count = var.enable_monitoring ? 1 : 0

  alarm_name          = "${var.frontend_domain}-cloudfront-error-rate"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = "2"
  metric_name         = "4xxErrorRate"
  namespace           = "AWS/CloudFront"
  period              = "300"
  statistic           = "Average"
  threshold           = "5"
  alarm_description   = "This metric monitors CloudFront 4xx error rate"
  alarm_actions       = var.sns_topic_arn != "" ? [var.sns_topic_arn] : []

  dimensions = {
    DistributionId = aws_cloudfront_distribution.frontend.id
  }

  tags = var.tags
}
