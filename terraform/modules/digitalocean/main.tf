# DigitalOcean Module - Application Server Infrastructure

terraform {
  required_providers {
    digitalocean = {
      source  = "digitalocean/digitalocean"
      version = "~> 2.0"
    }
  }
}

# SSH Key for secure access
resource "digitalocean_ssh_key" "main" {
  name       = var.ssh_key_name
  public_key = var.ssh_public_key
}

# Main application droplet
resource "digitalocean_droplet" "app_server" {
  image  = var.droplet_image
  name   = var.droplet_name
  region = var.droplet_region
  size   = var.droplet_size

  ssh_keys = [digitalocean_ssh_key.main.fingerprint]

  # Enable monitoring and backups
  monitoring = var.enable_monitoring
  backups    = var.enable_backups

  # User data for initial setup
  user_data = templatefile("${path.module}/files/cloud-init.yml", {
    project_name = var.project_name
    environment  = var.environment
  })

  tags = concat(
    [var.project_name, var.environment, "web-server"],
    var.tags
  )

  # Prevent accidental destruction
  #   lifecycle {
  #     prevent_destroy = true
  #   }
}

# Firewall for security
resource "digitalocean_firewall" "app_firewall" {
  name = "${var.project_name}-${var.environment}-firewall"

  droplet_ids = [digitalocean_droplet.app_server.id]

  # SSH access (restrict to specific IPs in production)
  inbound_rule {
    protocol         = "tcp"
    port_range       = "22"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # HTTP access
  inbound_rule {
    protocol         = "tcp"
    port_range       = "80"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # HTTPS access
  inbound_rule {
    protocol         = "tcp"
    port_range       = "443"
    source_addresses = ["0.0.0.0/0", "::/0"]
  }

  # Allow all outbound traffic
  outbound_rule {
    protocol              = "tcp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "udp"
    port_range            = "1-65535"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }

  outbound_rule {
    protocol              = "icmp"
    destination_addresses = ["0.0.0.0/0", "::/0"]
  }
}

# Project for organization
resource "digitalocean_project" "main" {
  name        = var.project_name
  description = "Infrastructure for ${var.project_name} ${var.environment} environment"
  purpose     = "Web Application"
  environment = lower(var.environment) # must be one of: development, staging, production

  resources = [
    digitalocean_droplet.app_server.urn
  ]
}

# Monitoring alerts
resource "digitalocean_monitor_alert" "cpu_alert" {
  count = var.enable_monitoring ? 1 : 0

  alerts {
    email = var.alert_email != "" ? [var.alert_email] : []
  }

  window      = "5m"
  type        = "v1/insights/droplet/cpu"
  compare     = "GreaterThan"
  value       = 80
  enabled     = true
  entities    = [digitalocean_droplet.app_server.id]
  description = "CPU usage is above 80%"
}

resource "digitalocean_monitor_alert" "memory_alert" {
  count = var.enable_monitoring ? 1 : 0

  alerts {
    email = var.alert_email != "" ? [var.alert_email] : []
  }

  window      = "5m"
  type        = "v1/insights/droplet/memory_utilization_percent"
  compare     = "GreaterThan"
  value       = 85
  enabled     = true
  entities    = [digitalocean_droplet.app_server.id]
  description = "Memory usage is above 85%"
}

# Reserved IP (optional, for production stability)
resource "digitalocean_reserved_ip" "app_ip" {
  count  = var.enable_reserved_ip ? 1 : 0
  region = var.droplet_region
}

resource "digitalocean_reserved_ip_assignment" "app_ip_assignment" {
  count      = var.enable_reserved_ip ? 1 : 0
  ip_address = digitalocean_reserved_ip.app_ip[0].ip_address
  droplet_id = digitalocean_droplet.app_server.id
}
