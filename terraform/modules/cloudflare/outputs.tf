# Outputs for Cloudflare Module

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
  value       = cloudflare_record.api.hostname
}

output "www_dns_record_id" {
  description = "ID of the www DNS record"
  value       = cloudflare_record.www.id
}

output "www_dns_record_hostname" {
  description = "Hostname of the www DNS record"
  value       = cloudflare_record.www.hostname
}

output "frontend_dns_record_id" {
  description = "ID of the frontend DNS record"
  value       = cloudflare_record.frontend.id
}

output "frontend_dns_record_hostname" {
  description = "Hostname of the frontend DNS record"
  value       = cloudflare_record.frontend.hostname
}

# Security Features
output "security_rules_enabled" {
  description = "Whether security rules are enabled"
  value       = var.enable_security_rules
}

output "firewall_rule_id" {
  description = "ID of the firewall rule (if enabled)"
  value       = var.enable_security_rules ? cloudflare_firewall_rule.block_bad_bots[0].id : null
}

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
output "www_redirect_rule_id" {
  description = "ID of the www redirect page rule"
  value       = cloudflare_page_rule.www_redirect.id
}

output "api_cache_rule_id" {
  description = "ID of the API cache page rule (if enabled)"
  value       = var.enable_api_caching ? cloudflare_page_rule.api_cache[0].id : null
}

# DNS Configuration Summary
output "dns_configuration" {
  description = "Summary of DNS configuration"
  value = {
    api_domain = {
      hostname = cloudflare_record.api.hostname
      proxied  = cloudflare_record.api.proxied
      type     = cloudflare_record.api.type
    }
    www_domain = {
      hostname = cloudflare_record.www.hostname
      proxied  = cloudflare_record.www.proxied
      type     = cloudflare_record.www.type
    }
    frontend_domain = {
      hostname = cloudflare_record.frontend.hostname
      proxied  = cloudflare_record.frontend.proxied
      type     = cloudflare_record.frontend.type
    }
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
    minification      = true
    http3_enabled     = true
    zero_rtt_enabled  = true
    early_hints       = true
    api_caching       = var.enable_api_caching
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
    dns_records_created    = 3
    security_rules_active  = var.enable_security_rules
    performance_optimized  = true
    ssl_configured        = true
    caching_optimized     = var.enable_api_caching
  }
}
