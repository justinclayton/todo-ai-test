#!/bin/bash
set -e

STAGE=${1:-dev}

cd infrastructure/terraform

echo "Validating Terraform configuration..."
terraform fmt -check
terraform validate

echo "Initializing Terraform..."
terraform init

echo "Selecting workspace: $STAGE"
terraform workspace select $STAGE || terraform workspace new $STAGE

echo "Planning Terraform deployment for $STAGE..."
terraform plan -out=tfplan-$STAGE
