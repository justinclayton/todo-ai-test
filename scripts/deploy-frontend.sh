#!/bin/bash
set -e

STAGE=${1:-dev}

cd infrastructure/terraform

# Get S3 bucket name and CloudFront distribution ID
BUCKET_NAME=$(terraform output -raw s3_bucket_name)
CLOUDFRONT_ID=$(terraform output -raw cloudfront_distribution_id 2>/dev/null || echo "")

echo "Building frontend..."
cd ../../frontend
npm install
VITE_API_BASE_URL=$(cd ../infrastructure/terraform && terraform output -raw api_base_url) npm run build

echo "Uploading to S3 bucket: $BUCKET_NAME..."

# Upload HTML files with short cache
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --exclude "*" \
  --include "*.html" \
  --cache-control "max-age=300, no-cache" \
  --delete

# Upload JS/CSS files with long cache
aws s3 sync dist/ s3://$BUCKET_NAME/ \
  --exclude "*.html" \
  --cache-control "max-age=31536000, immutable" \
  --delete

echo "Frontend deployed to S3!"

if [ -n "$CLOUDFRONT_ID" ] && [ "$CLOUDFRONT_ID" != "null" ]; then
  echo "Creating CloudFront invalidation..."
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_ID \
    --paths "/index.html" "/"
  echo "CloudFront invalidation created!"
fi

echo ""
echo "Frontend deployment complete!"
if [ -n "$CLOUDFRONT_ID" ] && [ "$CLOUDFRONT_ID" != "null" ]; then
  CLOUDFRONT_DOMAIN=$(cd ../infrastructure/terraform && terraform output -raw cloudfront_domain_name)
  echo "Frontend URL: https://$CLOUDFRONT_DOMAIN"
else
  S3_ENDPOINT=$(cd ../infrastructure/terraform && terraform output -raw s3_website_endpoint)
  echo "Frontend URL: http://$S3_ENDPOINT"
fi
