# Backend configuration for Terraform state management
# This stores the Terraform state in S3 for team collaboration and state locking

terraform {
  backend "s3" {
    # S3 bucket for storing Terraform state
    bucket = "elegant-tex-terraform-state"
    key    = "prod/terraform.tfstate"
    region = "ap-southeast-1"

    # DynamoDB table for state locking
    encrypt = true
  }
}

# Note: Before using this backend, you need to create:
# 1. S3 bucket: elegant-tex-terraform-state
# 2. DynamoDB table: elegant-tex-terraform-locks (with primary key: LockID)
#
# You can create these manually or use the bootstrap script provided
