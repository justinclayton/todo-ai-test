#!/bin/bash
set -e

cd infrastructure/terraform

echo "Initializing Terraform for local development..."
terraform init

echo "Creating/selecting local workspace..."
terraform workspace select local || terraform workspace new local

echo "Installing backend dependencies..."
cd ../../backend
npm install
cd ../infrastructure/terraform

echo "Applying Terraform configuration to LocalStack..."
terraform apply -auto-approve \
  -var="stage=dev" \
  -var="allowed_origin=http://localhost:3000" \
  -var="enable_cloudfront=false"

echo ""
echo "Infrastructure provisioned successfully!"
echo ""
echo "Outputs:"
terraform output

API_URL=$(terraform output -raw api_base_url)
echo ""
echo "Set this environment variable in your frontend:"
echo "VITE_API_BASE_URL=$API_URL"
