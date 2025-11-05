#!/bin/bash
set -e

STAGE=${1:-dev}
ALLOWED_ORIGIN=${2:-"*"}

cd infrastructure/terraform

echo "Installing backend dependencies..."
cd ../../backend
npm install
cd ../infrastructure/terraform

echo "Deploying infrastructure for $STAGE..."
terraform workspace select $STAGE || terraform workspace new $STAGE

terraform apply -auto-approve \
  -var="stage=$STAGE" \
  -var="allowed_origin=$ALLOWED_ORIGIN"

echo ""
echo "Deployment complete!"
echo ""
echo "Outputs:"
terraform output

echo ""
echo "Next: Deploy frontend with './scripts/deploy-frontend.sh $STAGE'"
