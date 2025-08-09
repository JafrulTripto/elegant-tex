# Outputs for DigitalOcean Module

# Droplet Information
output "droplet_id" {
  description = "ID of the DigitalOcean droplet"
  value       = digitalocean_droplet.app_server.id
}

output "droplet_ip" {
  description = "Public IP address of the DigitalOcean droplet"
  value       = var.enable_reserved_ip ? digitalocean_reserved_ip.app_ip[0].ip_address : digitalocean_droplet.app_server.ipv4_address
}

output "droplet_private_ip" {
  description = "Private IP address of the DigitalOcean droplet"
  value       = digitalocean_droplet.app_server.ipv4_address_private
}

output "droplet_urn" {
  description = "URN of the DigitalOcean droplet"
  value       = digitalocean_droplet.app_server.urn
}

output "droplet_name" {
  description = "Name of the DigitalOcean droplet"
  value       = digitalocean_droplet.app_server.name
}

output "droplet_region" {
  description = "Region of the DigitalOcean droplet"
  value       = digitalocean_droplet.app_server.region
}

output "droplet_size" {
  description = "Size of the DigitalOcean droplet"
  value       = digitalocean_droplet.app_server.size
}

# SSH Key Information
output "ssh_key_id" {
  description = "ID of the SSH key"
  value       = digitalocean_ssh_key.main.id
}

output "ssh_key_fingerprint" {
  description = "Fingerprint of the SSH key"
  value       = digitalocean_ssh_key.main.fingerprint
}

# Firewall Information
output "firewall_id" {
  description = "ID of the firewall"
  value       = digitalocean_firewall.app_firewall.id
}

output "firewall_name" {
  description = "Name of the firewall"
  value       = digitalocean_firewall.app_firewall.name
}

# Project Information
output "project_id" {
  description = "ID of the DigitalOcean project"
  value       = digitalocean_project.main.id
}

output "project_name" {
  description = "Name of the DigitalOcean project"
  value       = digitalocean_project.main.name
}

# Reserved IP Information (if enabled)
output "reserved_ip" {
  description = "Reserved IP address (if enabled)"
  value       = var.enable_reserved_ip ? digitalocean_reserved_ip.app_ip[0].ip_address : null
}

output "reserved_ip_urn" {
  description = "URN of the reserved IP (if enabled)"
  value       = var.enable_reserved_ip ? digitalocean_reserved_ip.app_ip[0].urn : null
}

# Monitoring Information
output "monitoring_enabled" {
  description = "Whether monitoring is enabled"
  value       = var.enable_monitoring
}

output "backups_enabled" {
  description = "Whether backups are enabled"
  value       = var.enable_backups
}

# Connection Information
output "ssh_connection_string" {
  description = "SSH connection string for the droplet"
  value       = "ssh root@${var.enable_reserved_ip ? digitalocean_reserved_ip.app_ip[0].ip_address : digitalocean_droplet.app_server.ipv4_address}"
}
