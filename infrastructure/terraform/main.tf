terraform {
  required_version = ">= 1.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    archive = {
      source  = "hashicorp/archive"
      version = "~> 2.0"
    }
  }

  # For production, configure remote backend
  # backend "s3" {
  #   bucket         = "your-terraform-state-bucket"
  #   key            = "todo-app/terraform.tfstate"
  #   region         = "us-east-1"
  #   dynamodb_table = "terraform-state-lock"
  #   encrypt        = true
  # }
}

provider "aws" {
  region = var.aws_region

  # For LocalStack development
  skip_credentials_validation = terraform.workspace == "local"
  skip_metadata_api_check     = terraform.workspace == "local"
  skip_requesting_account_id  = terraform.workspace == "local"

  endpoints {
    apigateway     = terraform.workspace == "local" ? "http://localhost:4566" : null
    cloudformation = terraform.workspace == "local" ? "http://localhost:4566" : null
    cloudfront     = terraform.workspace == "local" ? "http://localhost:4566" : null
    dynamodb       = terraform.workspace == "local" ? "http://localhost:4566" : null
    iam            = terraform.workspace == "local" ? "http://localhost:4566" : null
    lambda         = terraform.workspace == "local" ? "http://localhost:4566" : null
    s3             = terraform.workspace == "local" ? "http://s3.localhost.localstack.cloud:4566" : null
    sts            = terraform.workspace == "local" ? "http://localhost:4566" : null
    logs           = terraform.workspace == "local" ? "http://localhost:4566" : null
  }
}

locals {
  name_prefix = "${var.project_name}-${var.stage}"

  common_tags = {
    Project     = var.project_name
    Stage       = var.stage
    ManagedBy   = "Terraform"
    Environment = var.stage
  }
}
