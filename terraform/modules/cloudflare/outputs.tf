# Zone Information
output "zone_id" {
  description = "Cloudflare zone ID"
  value       = var.zone_id
}

output "zone_name" {
  description = "Cloudflare zone name"
  value       = data.cloudflare_zone.main.name
}

# DNS Record Information
output "api_dns_record_id" {
  description = "ID of the API DNS record"
  value       = cloudflare_record.api.id
}

output "api_dns_record_hostname" {
  description = "Hostname of the API DNS record"
  value       = cloudflare_record.api.name
}


# output "frontend_dns_record_id" {
#   description = "ID of the frontend DNS record"
#   value       = cloudflare_dns_record.frontend.id
# }
#
# output "frontend_dns_record_hostname" {
#   description = "Hostname of the frontend DNS record"
#   value       = cloudflare_dns_record.frontend.name
# }

# Security Features
output "security_rules_enabled" {
  description = "Whether security rules are enabled"
  value       = var.enable_security_rules
}

# output "firewall_rule_id" {
#   value       = var.enable_security_rules ? cloudflare_ruleset.block_bad_bots[0].id : null
#   description = "The ID of the ruleset blocking bad bots"
# }

output "api_caching_enabled" {
  description = "Whether API caching is enabled"
  value       = var.enable_api_caching
}

# SSL/TLS Information
output "ssl_mode" {
  description = "SSL mode configured for the zone"
  value       = "full"
}

output "origin_certificate_id" {
  description = "ID of the origin certificate (if created)"
  value       = var.create_origin_cert ? cloudflare_origin_ca_certificate.api_cert[0].id : null
}

# Page Rules
output "http_to_www_redirect_rule_id" {
  description = "ID of the www redirect page rule"
  value       = cloudflare_page_rule.http_to_www.id
}
output "https_to_www_redirect_rule_id" {
  description = "ID of the www redirect page rule"
  value       = cloudflare_page_rule.https_to_www.id
}

output "cache_static_rule_id" {
  description = "ID of the API cache page rule (if enabled)"
  value       = var.enable_api_caching ? cloudflare_page_rule.cache_static.id : null
}

# DNS Configuration Summary
output "dns_configuration" {
  description = "Summary of DNS configuration"
  value = {
    api_domain = {
      hostname = cloudflare_record.api.name
      proxied  = cloudflare_record.api.proxied
      type     = cloudflare_record.api.type
    }
    #     frontend_domain = {
    #       hostname = cloudflare_dns_record.frontend.name
    #       proxied  = cloudflare_dns_record.frontend.proxied
    #       type     = cloudflare_dns_record.frontend.type
    #     }
  }
}

# Security Configuration Summary
output "security_configuration" {
  description = "Summary of security configuration"
  value = {
    ssl_mode           = "full"
    security_level     = "medium"
    bot_management     = true
    firewall_rules     = var.enable_security_rules
    origin_certificate = var.create_origin_cert
  }
}

# Performance Configuration Summary
output "performance_configuration" {
  description = "Summary of performance configuration"
  value = {
    brotli_compression = true
    minification       = true
    http3_enabled      = true
    zero_rtt_enabled   = true
    early_hints        = true
    api_caching        = var.enable_api_caching
  }
}

# URLs and Access Points
output "access_urls" {
  description = "Access URLs for the configured domains"
  value = {
    api_url      = "https://${var.domain_name}"
    www_url      = "https://www.${var.domain_name}"
    frontend_url = "https://web.${var.domain_name}"
  }
}

# Configuration Status
output "configuration_status" {
  description = "Status of various configuration options"
  value = {
    dns_records_created   = 3
    security_rules_active = var.enable_security_rules
    performance_optimized = true
    ssl_configured        = true
    caching_optimized     = var.enable_api_caching
  }
}
