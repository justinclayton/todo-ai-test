#!/bin/bash
set -e

STAGE=${1:-dev}

cd infrastructure/terraform

echo "Destroying infrastructure for $STAGE..."
terraform workspace select $STAGE

# Empty S3 bucket first
BUCKET_NAME=$(terraform output -raw s3_bucket_name 2>/dev/null || echo "")
if [ -n "$BUCKET_NAME" ]; then
  echo "Emptying S3 bucket: $BUCKET_NAME..."
  aws s3 rm s3://$BUCKET_NAME --recursive || true
fi

terraform destroy -auto-approve

echo "Infrastructure destroyed!"
