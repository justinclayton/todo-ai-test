# Serverless Todo Application

A production-ready serverless Todo application built with React, AWS Lambda, DynamoDB, and Terraform.

## Architecture

- **Frontend**: React SPA served from S3 + CloudFront
- **API**: API Gateway + Lambda (Node.js 20)
- **Database**: DynamoDB
- **Infrastructure**: Terraform
- **Local Dev**: LocalStack

## Features

- ✅ Full CRUD operations for todos
- ✅ Client and server-side validation
- ✅ Structured JSON logging
- ✅ CORS support
- ✅ Pagination support
- ✅ Accessibility features
- ✅ Local development environment
- ✅ CI/CD with GitHub Actions
- ✅ Infrastructure as Code with Terraform

## Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Terraform 1.5+
- AWS CLI (for cloud deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd todo-ai-test
   ```

2. **Start LocalStack**
   ```bash
   ./scripts/start-local.sh
   ```

3. **Provision local infrastructure**
   ```bash
   ./scripts/terraform-local-init.sh
   ```

4. **Start the frontend**
   ```bash
   cd frontend
   npm install
   VITE_API_BASE_URL=http://localhost:4566/restapis/todo-api/dev/_user_request_ npm run dev
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - API: http://localhost:4566/restapis/todo-api/dev/_user_request_/todos

### Running Tests

**Backend tests:**
```bash
cd backend
npm install
npm test
```

**Frontend tests:**
```bash
cd frontend
npm install
npm test
```

## Deployment to AWS

### Prerequisites

1. Configure AWS credentials:
   ```bash
   aws configure
   ```

2. Set environment variables (or use GitHub Secrets for CI/CD):
   ```bash
   export AWS_ACCESS_KEY_ID=<your-key>
   export AWS_SECRET_ACCESS_KEY=<your-secret>
   export AWS_REGION=us-east-1
   ```

### Deploy Infrastructure

1. **Plan the deployment**
   ```bash
   ./scripts/terraform-plan.sh dev
   ```

2. **Apply infrastructure changes**
   ```bash
   ./scripts/terraform-apply.sh dev https://your-domain.com
   ```

3. **Deploy frontend**
   ```bash
   ./scripts/deploy-frontend.sh dev
   ```

### Terraform Workspaces

The project uses Terraform workspaces for multiple environments:

- `local` - LocalStack development
- `dev` - Development environment
- `prod` - Production environment

Switch workspaces:
```bash
cd infrastructure/terraform
terraform workspace select dev
```

## Project Structure

```
.
├── backend/                  # Lambda function code
│   ├── src/
│   │   └── index.js         # Main Lambda handler
│   ├── tests/               # Backend tests
│   ├── package.json
│   └── jest.config.js
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/      # React components
│   │   ├── App.jsx         # Main app component
│   │   ├── api.js          # API client
│   │   └── main.jsx        # Entry point
│   ├── tests/              # Frontend tests
│   ├── package.json
│   └── vite.config.js
├── infrastructure/
│   └── terraform/          # Terraform configuration
│       ├── main.tf
│       ├── variables.tf
│       ├── outputs.tf
│       ├── dynamodb.tf
│       ├── lambda.tf
│       ├── api_gateway.tf
│       ├── s3.tf
│       └── cloudfront.tf
├── scripts/                # Deployment scripts
│   ├── start-local.sh
│   ├── stop-local.sh
│   ├── terraform-local-init.sh
│   ├── terraform-plan.sh
│   ├── terraform-apply.sh
│   ├── deploy-frontend.sh
│   └── terraform-destroy.sh
├── .github/
│   └── workflows/          # CI/CD workflows
│       ├── ci.yml
│       └── deploy.yml
├── docker-compose.yml      # LocalStack setup
└── README.md
```

## API Endpoints

### Base URL
- Local: `http://localhost:4566/restapis/todo-api/dev/_user_request_`
- Cloud: `https://<api-id>.execute-api.<region>.amazonaws.com/dev`

### Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | /todos | List all todos (paginated) |
| POST | /todos | Create a new todo |
| GET | /todos/{id} | Get a specific todo |
| PUT | /todos/{id} | Update a todo |
| DELETE | /todos/{id} | Delete a todo |

### Todo Schema

```json
{
  "id": "uuid-v4",
  "title": "string (max 140 chars, required)",
  "description": "string (max 1000 chars, optional)",
  "completed": "boolean (default: false)",
  "createdAt": "ISO timestamp",
  "updatedAt": "ISO timestamp"
}
```

### Example Requests

**Create a todo:**
```bash
curl -X POST http://localhost:4566/restapis/todo-api/dev/_user_request_/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Buy groceries", "description": "Milk, eggs, bread"}'
```

**List todos:**
```bash
curl http://localhost:4566/restapis/todo-api/dev/_user_request_/todos
```

**Update a todo:**
```bash
curl -X PUT http://localhost:4566/restapis/todo-api/dev/_user_request_/todos/{id} \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

## Configuration

### Environment Variables

**Frontend:**
- `VITE_API_BASE_URL` - API base URL

**Backend (Lambda):**
- `TABLE_NAME` - DynamoDB table name (set by Terraform)
- `ALLOWED_ORIGIN` - CORS allowed origin (set by Terraform)
- `STAGE` - Deployment stage (dev/prod, set by Terraform)

**LocalStack:**
- `AWS_ACCESS_KEY_ID=test`
- `AWS_SECRET_ACCESS_KEY=test`
- `AWS_DEFAULT_REGION=us-east-1`

### Terraform Variables

Edit `infrastructure/terraform/variables.tf` or pass via command line:

```bash
terraform apply \
  -var="aws_region=us-east-1" \
  -var="project_name=todo-app" \
  -var="stage=dev" \
  -var="allowed_origin=https://your-domain.com" \
  -var="enable_cloudfront=true"
```

## CI/CD

The project includes GitHub Actions workflows:

### CI Workflow (`.github/workflows/ci.yml`)
Runs on pull requests and pushes to main:
- Lints backend and frontend code
- Runs all tests
- Builds frontend
- Validates Terraform configuration
- Creates Terraform plan

### Deploy Workflow (`.github/workflows/deploy.yml`)
Deploys to AWS on push to main:
- Applies Terraform changes
- Builds and deploys frontend to S3
- Invalidates CloudFront cache

### Required GitHub Secrets

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `ALLOWED_ORIGIN` (optional, defaults to *)

## CloudFront vs S3 Website Hosting

### CloudFront (Recommended)
- HTTPS support
- Better performance with caching
- Origin Access Control for security
- Set `enable_cloudfront=true` (default)

### S3 Website Hosting
- HTTP only
- Simpler setup for development
- Set `enable_cloudfront=false`

To switch:
```bash
terraform apply -var="enable_cloudfront=false"
```

## Monitoring and Logging

- **Lambda logs**: CloudWatch Logs at `/aws/lambda/<function-name>`
- **API Gateway logs**: CloudWatch Logs at `/aws/apigateway/<api-name>`
- **Structured JSON logging**: All logs include requestId, route, and timestamp

View logs locally:
```bash
docker-compose logs -f localstack
```

View logs in AWS:
```bash
aws logs tail /aws/lambda/todo-app-dev-api --follow
```

## Security

- IAM roles follow least-privilege principle
- S3 bucket blocks public access (when using CloudFront)
- API Gateway CORS properly configured
- DynamoDB encryption at rest enabled
- Point-in-time recovery enabled for production

### Security Considerations

- No authentication implemented (add AWS Cognito or API keys for production)
- Rate limiting not configured (consider API Gateway usage plans)
- WAF not configured (consider adding for production)

## Cleanup

### Local Environment
```bash
./scripts/stop-local.sh
docker-compose down -v  # Remove volumes
rm -rf .localstack/     # Remove persisted data
```

### AWS Resources
```bash
./scripts/terraform-destroy.sh dev
```

## Troubleshooting

### LocalStack Issues

**Services not starting:**
```bash
docker-compose down -v
docker-compose up -d
```

**Check LocalStack health:**
```bash
curl http://localhost:4566/_localstack/health
```

### Terraform Issues

**State lock:**
```bash
terraform force-unlock <lock-id>
```

**Lambda not updating:**
```bash
cd infrastructure/terraform
rm lambda.zip
terraform taint aws_lambda_function.api
terraform apply
```

### Frontend Issues

**API connection errors:**
- Check `VITE_API_BASE_URL` is set correctly
- Verify CORS headers in API responses
- Check network tab in browser DevTools

## Development Tips

### Hot Reloading

Frontend supports hot module replacement:
```bash
cd frontend
npm run dev
```

### Testing Against LocalStack

```bash
# Set AWS credentials for LocalStack
export AWS_ACCESS_KEY_ID=test
export AWS_SECRET_ACCESS_KEY=test
export AWS_DEFAULT_REGION=us-east-1

# Use awslocal CLI
pip install awscli-local
awslocal dynamodb scan --table-name todo-app-dev-todos
```

### Manual Testing

Use the included scripts or test manually:
```bash
# Create a todo
curl -X POST http://localhost:4566/restapis/todo-api/dev/_user_request_/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Test", "description": "Testing"}'

# List todos
curl http://localhost:4566/restapis/todo-api/dev/_user_request_/todos
```

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `npm test` in both backend and frontend
4. Run linters: `npm run lint`
5. Submit a pull request

## License

MIT License - see LICENSE file for details
