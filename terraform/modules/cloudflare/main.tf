terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# Zone info
data "cloudflare_zone" "main" {
  zone_id = var.zone_id
}

# Main domain (A record for API server)
resource "cloudflare_record" "api" {
  zone_id = var.zone_id
  name    = "api"
  type    = "A"
  content = var.api_server_ip
  proxied = true
  ttl     = 1
  comment = "API server - proxied through Cloudflare for security"
}

# Web frontend - points to CloudFront (DNS only)
# Uncomment if needed
resource "cloudflare_record" "frontend" {
  zone_id = var.zone_id
  name    = "www"
  type    = "CNAME"
  content = var.cloudfront_domain
  proxied = false
  ttl     = 300
  comment = "Frontend - DNS-only pointing to CloudFront"
}

# Zone-wide security & performance settings
resource "cloudflare_zone_settings_override" "site" {
  zone_id = var.zone_id

  settings {
    ssl               = "full"
    security_level    = "medium"
    challenge_ttl     = 1800
    browser_cache_ttl = 14400
    always_online     = "on"
    brotli            = "on"
    http3             = "on"
    early_hints       = "on"
  }
}



# Page Rules
resource "cloudflare_page_rule" "https_to_www" {
  zone_id  = var.zone_id
  target   = "https://${var.domain_name}/*"
  priority = 1
  status   = "active"

  actions {
    forwarding_url {
      url         = "https://www.${var.domain_name}/$1"
      status_code = 301
    }
  }
}

resource "cloudflare_page_rule" "http_to_www" {
  zone_id  = var.zone_id
  target   = "http://${var.domain_name}/*"
  priority = 2
  status   = "active"

  actions {
    forwarding_url {
      url         = "https://www.${var.domain_name}/$1"
      status_code = 301
    }
  }
}

resource "cloudflare_page_rule" "cache_static" {
  zone_id  = var.zone_id
  target   = "${var.domain_name}/static/*"
  priority = 3
  status   = "active"

  actions {
    cache_level = "cache_everything"
  }
}

# Optional: Origin CA cert (if needed)
resource "cloudflare_origin_ca_certificate" "api_cert" {
  count              = var.create_origin_cert ? 1 : 0
  csr                = var.origin_cert_csr
  hostnames          = [var.domain_name, "*.${var.domain_name}"]
  request_type       = "origin-rsa"
  requested_validity = 5475
}
