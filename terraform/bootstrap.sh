#!/bin/bash
# Bootstrap script for Terraform backend setup
# This creates the S3 bucket and DynamoDB table for Terraform state management

set -e

# Configuration
BUCKET_NAME="elegant-tex-terraform-state"
DYNAMODB_TABLE="elegant-tex-terraform-locks"
AWS_REGION="ap-southeast-1"

echo "🚀 Setting up Terraform backend infrastructure..."
echo "Bucket: $BUCKET_NAME"
echo "DynamoDB Table: $DYNAMODB_TABLE"
echo "Region: $AWS_REGION"
echo ""

# Check if AWS CLI is installed
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI is not installed. Please install it first:"
    echo "   curl 'https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip' -o 'awscliv2.zip'"
    echo "   unzip awscliv2.zip"
    echo "   sudo ./aws/install"
    exit 1
fi

# Check if AWS credentials are configured
if ! aws sts get-caller-identity &> /dev/null; then
    echo "❌ AWS credentials not configured. Please run:"
    echo "   aws configure"
    exit 1
fi

echo "✅ AWS CLI configured"

# Create S3 bucket for Terraform state
echo "📦 Creating S3 bucket for Terraform state..."
if aws s3api head-bucket --bucket "$BUCKET_NAME" 2>/dev/null; then
    echo "✅ S3 bucket $BUCKET_NAME already exists"
else
    # Create bucket with appropriate region constraint
    if [ "$AWS_REGION" = "us-east-1" ]; then
        aws s3api create-bucket --bucket "$BUCKET_NAME" --region "$AWS_REGION"
    else
        aws s3api create-bucket \
            --bucket "$BUCKET_NAME" \
            --region "$AWS_REGION" \
            --create-bucket-configuration LocationConstraint="$AWS_REGION"
    fi
    echo "✅ Created S3 bucket: $BUCKET_NAME"
fi

# Enable versioning on the bucket
echo "🔄 Enabling versioning on S3 bucket..."
aws s3api put-bucket-versioning \
    --bucket "$BUCKET_NAME" \
    --versioning-configuration Status=Enabled
echo "✅ Versioning enabled"

# Enable server-side encryption
echo "🔒 Enabling server-side encryption..."
aws s3api put-bucket-encryption \
    --bucket "$BUCKET_NAME" \
    --server-side-encryption-configuration '{
        "Rules": [
            {
                "ApplyServerSideEncryptionByDefault": {
                    "SSEAlgorithm": "AES256"
                }
            }
        ]
    }'
echo "✅ Encryption enabled"

# Block public access
echo "🚫 Blocking public access..."
aws s3api put-public-access-block \
    --bucket "$BUCKET_NAME" \
    --public-access-block-configuration \
    BlockPublicAcls=true,IgnorePublicAcls=true,BlockPublicPolicy=true,RestrictPublicBuckets=true
echo "✅ Public access blocked"

# Create DynamoDB table for state locking (On-Demand pricing)
echo "🔐 Creating DynamoDB table for state locking (On-Demand)..."
if aws dynamodb describe-table --table-name "$DYNAMODB_TABLE" --region "$AWS_REGION" &> /dev/null; then
    echo "✅ DynamoDB table $DYNAMODB_TABLE already exists"
else
    aws dynamodb create-table \
        --table-name "$DYNAMODB_TABLE" \
        --attribute-definitions AttributeName=LockID,AttributeType=S \
        --key-schema AttributeName=LockID,KeyType=HASH \
        --billing-mode PAY_PER_REQUEST \
        --region "$AWS_REGION"
    
    echo "⏳ Waiting for DynamoDB table to be active..."
    aws dynamodb wait table-exists --table-name "$DYNAMODB_TABLE" --region "$AWS_REGION"
    echo "✅ Created DynamoDB table: $DYNAMODB_TABLE (On-Demand pricing)"
fi

# Create lifecycle policy for cost optimization
echo "💰 Setting up lifecycle policy for cost optimization..."
aws s3api put-bucket-lifecycle-configuration \
    --bucket "$BUCKET_NAME" \
    --lifecycle-configuration '{
        "Rules": [
            {
                "ID": "terraform-state-lifecycle",
                "Status": "Enabled",
                "Filter": {"Prefix": ""},
                "Transitions": [
                    {
                        "Days": 30,
                        "StorageClass": "STANDARD_IA"
                    },
                    {
                        "Days": 90,
                        "StorageClass": "GLACIER"
                    }
                ],
                "NoncurrentVersionTransitions": [
                    {
                        "NoncurrentDays": 30,
                        "StorageClass": "STANDARD_IA"
                    },
                    {
                        "NoncurrentDays": 90,
                        "StorageClass": "GLACIER"
                    }
                ],
                "NoncurrentVersionExpiration": {
                    "NoncurrentDays": 365
                }
            }
        ]
    }'
echo "✅ Lifecycle policy configured"

echo ""
echo "🎉 Terraform backend infrastructure setup complete!"
echo ""
echo "📋 Summary:"
echo "   S3 Bucket: $BUCKET_NAME"
echo "   DynamoDB Table: $DYNAMODB_TABLE"
echo "   Region: $AWS_REGION"
echo "   Versioning: Enabled"
echo "   Encryption: Enabled"
echo "   Public Access: Blocked"
echo "   Lifecycle Policy: Configured"
echo ""
echo "🔧 Next steps:"
echo "1. Update terraform/backend.tf with your bucket name if different"
echo "2. Run: cd terraform && terraform init"
echo "3. Run: terraform plan"
echo "4. Run: terraform apply"
echo ""
echo "💡 Cost optimization:"
echo "   - State files will transition to IA after 30 days"
echo "   - Old versions will be archived to Glacier after 90 days"
echo "   - Very old versions will be deleted after 365 days"
echo "   - DynamoDB uses on-demand pricing (~$0.10-0.50/month)"
echo ""
echo "🔒 Security:"
echo "   - Bucket is encrypted with AES256"
echo "   - Public access is completely blocked"
echo "   - DynamoDB table provides state locking (on-demand)"
