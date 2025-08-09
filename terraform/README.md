# Elegant-Tex Infrastructure with Terraform

This directory contains the complete Terraform configuration for managing the Elegant-Tex infrastructure across DigitalOcean, AWS, and Cloudflare.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │   DigitalOcean   │    │      AWS        │
│                 │    │                  │    │                 │
│ DNS Management  │    │ Application      │    │ S3 Storage      │
│ Security Rules  │────│ Server (Droplet) │────│ CloudFront CDN  │
│ SSL/TLS         │    │ Docker + DB      │    │ Cost Optimized  │
│ Performance     │    │ Monitoring       │    │ Lifecycle Mgmt  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 🎯 Optimized Setup
- **Cloudflare**: DNS-only for frontend (web.elegant-tex.com) → CloudFront
- **Cloudflare**: Proxied for API (elegant-tex.com) → DigitalOcean
- **No CDN Redundancy**: Cost-optimized routing

## 📁 Directory Structure

```
terraform/
├── main.tf                     # Root configuration
├── variables.tf               # Input variables
├── outputs.tf                # Output values
├── providers.tf              # Provider configurations
├── backend.tf                # Remote state management
├── terraform.tfvars.example  # Example variables
├── modules/
│   ├── digitalocean/         # Droplet, firewall, monitoring
│   ├── aws/                  # S3, CloudFront optimization
│   └── cloudflare/           # DNS, security (optimized)
└── environments/
    └── prod/                 # Production environment
```

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Terraform
curl -fsSL https://apt.releases.hashicorp.com/gpg | sudo apt-key add -
sudo apt-add-repository "deb [arch=amd64] https://apt.releases.hashicorp.com $(lsb_release -cs) main"
sudo apt-get update && sudo apt-get install terraform

# Verify installation
terraform version
```

### 2. Setup Configuration

```bash
# Clone and navigate
cd terraform

# Copy example variables
cp terraform.tfvars.example terraform.tfvars

# Edit with your values
nano terraform.tfvars
```

### 3. Required Secrets

Set these in your environment or GitHub Secrets:

```bash
# DigitalOcean
export DIGITALOCEAN_TOKEN="your_do_token"

# AWS
export AWS_ACCESS_KEY_ID="your_aws_key"
export AWS_SECRET_ACCESS_KEY="your_aws_secret"

# Cloudflare
export CLOUDFLARE_API_TOKEN="your_cf_token"
```

### 4. Initialize and Deploy

```bash
# Initialize Terraform
terraform init

# Plan deployment
terraform plan

# Apply changes
terraform apply
```

## 🔧 Configuration

### Required Variables

```hcl
# terraform.tfvars
ssh_public_key     = "ssh-rsa AAAAB3NzaC1yc2EAAAA..."
cloudflare_zone_id = "your-zone-id"
alert_email        = "admin@elegant-tex.com"
```

### Cost Optimization Settings

```hcl
# Enabled by default for cost savings
enable_s3_intelligent_tiering = true
s3_lifecycle_enabled         = true
cloudfront_price_class       = "PriceClass_100"  # US/EU only
enable_reserved_ip          = false              # Disable for cost
```

## 💰 Cost Breakdown

| Service | Resource | Monthly Cost |
|---------|----------|--------------|
| DigitalOcean | 1vCPU, 2GB Droplet | ~$12 |
| AWS | S3 + CloudFront | ~$2 |
| AWS | DynamoDB (On-Demand) | ~$0.10-0.50 |
| Cloudflare | DNS + Security | Free |
| **Total** | | **~$14-15/month** |

### Cost Optimization Features

✅ **S3 Intelligent-Tiering**: Automatic storage class transitions  
✅ **CloudFront PriceClass_100**: US/Canada/Europe only  
✅ **Lifecycle Policies**: Automated cleanup  
✅ **No Reserved IP**: Use dynamic IP (can enable if needed)  
✅ **Optimized CDN Setup**: No redundant CDN costs  

## 🔒 Security Features

### DigitalOcean
- Firewall rules (SSH, HTTP, HTTPS)
- Automated backups
- Monitoring and alerts
- Fail2ban protection

### AWS
- S3 bucket encryption
- CloudFront SSL/TLS
- Public access blocked
- Origin Access Identity

### Cloudflare
- SSL/TLS Full (Strict)
- Security rules and bot management
- Rate limiting
- DDoS protection

## 📊 Monitoring

### Enabled Monitoring
- **DigitalOcean**: CPU, Memory, Disk alerts
- **AWS**: CloudFront error rate monitoring
- **Cloudflare**: Analytics and security insights

### Health Checks
- Automated health check script on droplet
- Container monitoring
- Disk space monitoring
- Log rotation

## 🔄 GitHub Actions Integration

### Workflows Created
- `.github/workflows/terraform-plan.yml` - Plan on PR
- `.github/workflows/terraform-apply.yml` - Apply on merge

### Required GitHub Secrets
```
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
AWS_REGION
DIGITALOCEAN_TOKEN
CLOUDFLARE_API_TOKEN
SSH_PUBLIC_KEY
CLOUDFLARE_ZONE_ID
ALERT_EMAIL
```

## 🛠️ Management Commands

### Common Operations

```bash
# Check current state
terraform show

# View outputs
terraform output

# Plan specific changes
terraform plan -target=module.digitalocean

# Import existing resources
terraform import module.aws.aws_s3_bucket.storage et-prod-storage

# Destroy (careful!)
terraform destroy
```

### Scaling Operations

```bash
# Upgrade droplet size
terraform apply -var="droplet_size=s-2vcpu-4gb"

# Enable reserved IP for production
terraform apply -var="enable_reserved_ip=true"

# Add monitoring alerts
terraform apply -var="alert_email=admin@elegant-tex.com"
```

## 🔧 Troubleshooting

### Common Issues

**1. State Lock Issues**
```bash
# Force unlock (use carefully)
terraform force-unlock LOCK_ID
```

**2. Provider Authentication**
```bash
# Verify credentials
terraform providers
```

**3. Resource Import**
```bash
# Import existing droplet
terraform import module.digitalocean.digitalocean_droplet.app_server 123456789
```

### Validation

```bash
# Format check
terraform fmt -check -recursive

# Validate configuration
terraform validate

# Security scan (optional)
tfsec .
```

## 📈 Scaling Guide

### Current Capacity
- **60 concurrent users** (tested)
- **1vCPU, 2GB RAM** droplet
- **Singapore region** (low latency for Asia)

### Scaling Options

**Vertical Scaling (Recommended)**
```hcl
droplet_size = "s-2vcpu-4gb"  # ~$24/month
# or
droplet_size = "s-4vcpu-8gb"  # ~$48/month
```

**Horizontal Scaling (Future)**
- Enable load balancer module
- Add multiple droplets
- Database separation

## 🔄 Migration Guide

### From Manual Setup

1. **Import existing resources**
```bash
terraform import module.digitalocean.digitalocean_droplet.app_server YOUR_DROPLET_ID
terraform import module.aws.aws_s3_bucket.storage et-prod-storage
terraform import module.aws.aws_s3_bucket.frontend web.elegant-tex.com
```

2. **Verify state matches reality**
```bash
terraform plan  # Should show no changes
```

3. **Enable Terraform management**
```bash
terraform apply  # Apply any optimizations
```

## 📚 Additional Resources

- [Terraform Documentation](https://www.terraform.io/docs)
- [DigitalOcean Provider](https://registry.terraform.io/providers/digitalocean/digitalocean/latest/docs)
- [AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest/docs)
- [Cloudflare Provider](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs)

## 🆘 Support

For issues with this Terraform configuration:

1. Check the [troubleshooting section](#troubleshooting)
2. Review GitHub Actions logs
3. Validate your `terraform.tfvars` file
4. Ensure all required secrets are set

---

**Infrastructure as Code** ✨  
*Managed with Terraform for reliability, scalability, and cost optimization*
