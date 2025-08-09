terraform {
  required_providers {
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}

# Zone info
data "cloudflare_zone" "main" {
  zone_id = var.zone_id
}

# Main domain (A record for API server)
# resource "cloudflare_dns_record" "api" {
#   zone_id = var.zone_id
#   name    = "api"
#   type    = "A"
#   content = var.api_server_ip
#   proxied = true
#   ttl     = 1
#   comment = "API server - proxied through Cloudflare for security"
#   settings = {
#     ipv4_only = true
#     ipv6_only = true
#   }
#   tags = ["owner:dns-team"]
# }

# Web frontend - points to CloudFront (DNS only)
# resource "cloudflare_dns_record" "frontend" {
#   zone_id = var.zone_id
#   name    = "web"
#   type    = "CNAME"
#   content = var.cloudfront_domain
#   proxied = false
#   ttl     = 300
#   comment = "Frontend - DNS-only pointing to CloudFront"
# }

# Zone-wide security & performance settings
resource "cloudflare_zone_setting" "ssl" {
  zone_id     = var.zone_id
  setting_id  = "ssl"
  value       = "full"
}

resource "cloudflare_zone_setting" "security_level" {
  zone_id     = var.zone_id
  setting_id  = "security_level"
  value       = "medium"
}

resource "cloudflare_zone_setting" "challenge_ttl" {
  zone_id     = var.zone_id
  setting_id  = "challenge_ttl"
  value       = "1800"
}

resource "cloudflare_zone_setting" "browser_cache_ttl" {
  zone_id     = var.zone_id
  setting_id  = "browser_cache_ttl"
  value       = 14400
}

resource "cloudflare_zone_setting" "always_online" {
  zone_id     = var.zone_id
  setting_id  = "always_online"
  value       = "on"
}

resource "cloudflare_zone_setting" "brotli" {
  zone_id     = var.zone_id
  setting_id  = "brotli"
  value       = "on"
}

resource "cloudflare_zone_setting" "http3" {
  zone_id     = var.zone_id
  setting_id  = "http3"
  value       = "on"
}

resource "cloudflare_zone_setting" "early_hints" {
  zone_id     = var.zone_id
  setting_id  = "early_hints"
  value       = "on"
}

resource "cloudflare_zone_setting" "minify" {
  zone_id    = var.zone_id
  setting_id = "minify"
  value = {
    css  = "on"
    js   = "on"
    html = "on"
  }
}


resource "cloudflare_page_rule" "https_to_www" {
  zone_id  = var.zone_id
  target   = "https://${var.domain_name}/*"
  priority = 1
  status   = "active"

  actions = {
    forwarding_url = {
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

  actions = {
    forwarding_url = {
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

  actions = {
    cache_level = "cache_everything"
  }
}



# Ruleset: block bad bots using Cloudflare's new ruleset API
# resource "cloudflare_ruleset" "block_bad_bots" {
#   count   = var.enable_security_rules ? 1 : 0
#   name    = "Block bad bots"
#   kind    = "zone"
#   phase   = "http_request_firewall_custom"
#   zone_id = var.zone_id
#
#   rules = [{
#     enabled     = true
#     action      = "block"
#     description = "Block known bad bots"
#     expression  = "(cf.client.bot and not cf.verified_bot_category in {\"Search Engine Crawler\", \"Social Media Agent\", \"Monitoring & Analytics\"})"
#   }]
# }


# Optional: Origin CA cert (if needed)
resource "cloudflare_origin_ca_certificate" "api_cert" {
  count              = var.create_origin_cert ? 1 : 0
  csr                = var.origin_cert_csr
  hostnames          = [var.domain_name, "*.${var.domain_name}"]
  request_type       = "origin-rsa"
  requested_validity = 5475
}
