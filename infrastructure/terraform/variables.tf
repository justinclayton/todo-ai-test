variable "aws_region" {
  description = "AWS region for all resources"
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used for resource naming"
  type        = string
  default     = "todo-app"
}

variable "stage" {
  description = "Deployment stage (dev, prod)"
  type        = string
  default     = "dev"
}

variable "allowed_origin" {
  description = "CORS allowed origin for API Gateway"
  type        = string
  default     = "*"
}

variable "enable_cloudfront" {
  description = "Enable CloudFront distribution for frontend"
  type        = bool
  default     = true
}

variable "domain_name" {
  description = "Optional custom domain name"
  type        = string
  default     = ""
}

variable "certificate_arn" {
  description = "Optional ACM certificate ARN for custom domain"
  type        = string
  default     = ""
}
