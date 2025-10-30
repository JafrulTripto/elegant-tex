# Variables for DigitalOcean Module

# Droplet Configuration
variable "droplet_name" {
  description = "Name of the DigitalOcean droplet"
  type        = string
}

variable "droplet_size" {
  description = "Size of the DigitalOcean droplet"
  type        = string
}

variable "droplet_region" {
  description = "DigitalOcean region"
  type        = string
}

variable "droplet_image" {
  description = "DigitalOcean droplet image"
  type        = string
}

# SSH Configuration
variable "ssh_key_name" {
  description = "Name for the SSH key"
  type        = string
}

variable "ssh_public_key" {
  description = "SSH public key for droplet access"
  type        = string
  sensitive   = true
}

# Project Configuration
variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (prod, staging, dev)"
  type        = string
}

variable "tags" {
  description = "List of tags to apply to resources"
  type        = list(string)
  default     = []
}

# Monitoring and Backup Configuration
variable "enable_monitoring" {
  description = "Enable DigitalOcean monitoring"
  type        = bool
  default     = true
}

variable "enable_backups" {
  description = "Enable automated backups"
  type        = bool
  default     = false
}

variable "alert_email" {
  description = "Email address for monitoring alerts"
  type        = string
  default     = ""
}

# Optional Features
variable "enable_reserved_ip" {
  description = "Enable reserved IP for the droplet"
  type        = bool
  default     = false
}
