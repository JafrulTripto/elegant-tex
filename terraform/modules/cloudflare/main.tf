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
  name    = "@"
  type    = "A"
  content = var.api_server_ip
  proxied = true
  ttl     = 1
  comment = "API server - proxied through Cloudflare for security"
}

# www subdomain redirect (CNAME to root)
resource "cloudflare_record" "www" {
  zone_id = var.zone_id
  name    = "www"
  type    = "CNAME"
  content = var.domain_name
  proxied = true
  ttl     = 1
  comment = "WWW redirect to main domain"
}

# Web frontend - points to CloudFront (DNS only)
resource "cloudflare_record" "frontend" {
  zone_id = var.zone_id
  name    = "web"
  type    = "CNAME"
  content = var.cloudfront_domain
  proxied = false
  ttl     = 300
  comment = "Frontend - DNS-only pointing to CloudFront"
}

# Zone-wide security & performance settings
resource "cloudflare_zone_settings_override" "main" {
  zone_id = var.zone_id

  settings {
    ssl                  = "full"
    security_level       = "medium"
    challenge_ttl        = 1800
    browser_cache_ttl    = 14400
    always_online        = "on"
    brotli               = "on"
    http3                = "on"
    zero_rtt             = "on"
    early_hints          = "on"

    minify {
      css  = "on"
      js   = "on"
      html = "on"
    }
  }
}

# Page rule: redirect www -> root domain
resource "cloudflare_page_rule" "www_redirect" {
  zone_id  = var.zone_id
  target   = "www.${var.domain_name}/*"
  priority = 1
  status   = "active"

  actions {
    forwarding_url {
      url         = "https://${var.domain_name}/$1"
      status_code = 301
    }
  }
}

# Page rule: cache static assets (only if enabled)
resource "cloudflare_page_rule" "api_cache" {
  count    = var.enable_api_caching ? 1 : 0
  zone_id  = var.zone_id
  target   = "${var.domain_name}/static/*"
  priority = 2
  status   = "active"

  actions {
    cache_level = "cache_everything"
  }
}

# Ruleset: block bad bots using Cloudflare's new ruleset API
resource "cloudflare_ruleset" "block_bad_bots" {
  count   = var.enable_security_rules ? 1 : 0

  name    = "Block bad bots"
  kind    = "zone"
  phase   = "http_request_firewall_custom"
  zone_id = var.zone_id

  rules {
    enabled     = true
    action      = "block"
    description = "Block known bad bots"
    expression  = "(cf.client.bot and not cf.verified_bot_category in {\"Search Engine Crawler\", \"Social Media Agent\", \"Monitoring & Analytics\"})"
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
