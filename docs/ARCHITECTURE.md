# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                            End Users                                │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         CloudFront CDN                              │
│  - HTTPS/TLS termination                                           │
│  - Global edge caching                                             │
│  - Origin Access Control (OAC)                                     │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    Amazon S3 Bucket                                 │
│  - Static website hosting (React SPA)                              │
│  - Versioning enabled                                              │
│  - Server-side encryption (SSE-S3)                                 │
│  - Bucket policy restricts access to CloudFront                    │
└─────────────────────────────────────────────────────────────────────┘


         Frontend calls API
              │
              │ HTTPS
              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      API Gateway (REST)                             │
│  - CORS configuration                                              │
│  - Request validation                                              │
│  - Access logging to CloudWatch                                    │
│  - Stage: dev / prod                                               │
│                                                                     │
│  Endpoints:                                                        │
│  - GET    /todos        (list all todos)                          │
│  - POST   /todos        (create todo)                             │
│  - GET    /todos/{id}   (get todo by id)                          │
│  - PUT    /todos/{id}   (update todo)                             │
│  - DELETE /todos/{id}   (delete todo)                             │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ AWS_PROXY integration
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       AWS Lambda                                    │
│  Runtime: Node.js 20                                               │
│  Memory: 512 MB                                                    │
│  Timeout: 10 seconds                                               │
│                                                                     │
│  Environment Variables:                                            │
│  - TABLE_NAME                                                      │
│  - ALLOWED_ORIGIN                                                  │
│  - STAGE                                                           │
│                                                                     │
│  Handler: src/index.handler                                        │
│  - Request routing                                                 │
│  - Input validation                                                │
│  - Error handling                                                  │
│  - Structured JSON logging                                         │
└────────────────────────────┬────────────────────────────────────────┘
                             │
                             │ AWS SDK v3
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      Amazon DynamoDB                                │
│  Table: todo-app-{stage}-todos                                     │
│  Primary Key: id (String)                                          │
│  Billing: On-demand                                                │
│  Encryption: At rest (AWS managed)                                 │
│  Point-in-time recovery: Enabled (prod)                            │
│                                                                     │
│  Item Schema:                                                      │
│  {                                                                 │
│    id: "uuid-v4",                                                  │
│    title: "string (max 140)",                                      │
│    description: "string (max 1000)",                               │
│    completed: boolean,                                             │
│    createdAt: "ISO timestamp",                                     │
│    updatedAt: "ISO timestamp"                                      │
│  }                                                                 │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                     CloudWatch Logs                                 │
│  Log Groups:                                                       │
│  - /aws/lambda/todo-app-{stage}-api                               │
│  - /aws/apigateway/todo-app-{stage}                               │
│                                                                     │
│  Retention:                                                        │
│  - Dev: 7 days                                                     │
│  - Prod: 30 days                                                   │
└─────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────┐
│                         IAM Roles                                   │
│                                                                     │
│  Lambda Execution Role:                                            │
│  - logs:CreateLogGroup                                             │
│  - logs:CreateLogStream                                            │
│  - logs:PutLogEvents                                               │
│  - dynamodb:GetItem                                                │
│  - dynamodb:PutItem                                                │
│  - dynamodb:UpdateItem                                             │
│  - dynamodb:DeleteItem                                             │
│  - dynamodb:Scan                                                   │
│  - dynamodb:Query                                                  │
└─────────────────────────────────────────────────────────────────────┘
```

## Local Development Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      Developer Machine                              │
│                                                                     │
│  ┌─────────────────────┐         ┌──────────────────────┐         │
│  │  Frontend Dev       │         │   Docker Compose     │         │
│  │  (Vite)             │         │                      │         │
│  │  Port: 3000         │         │  ┌────────────────┐  │         │
│  │                     │◄────────┤  │   LocalStack   │  │         │
│  └─────────────────────┘         │  │   Port: 4566   │  │         │
│            │                     │  │                │  │         │
│            │ API calls           │  │  Services:     │  │         │
│            │                     │  │  - S3          │  │         │
│            │                     │  │  - DynamoDB    │  │         │
│            ▼                     │  │  - API Gateway │  │         │
│  http://localhost:4566           │  │  - Lambda      │  │         │
│                                  │  │  - CloudFront  │  │         │
│                                  │  │  - IAM         │  │         │
│                                  │  │  - CloudWatch  │  │         │
│                                  │  └────────────────┘  │         │
│                                  │                      │         │
│                                  │  Volume:             │         │
│                                  │  .localstack/        │         │
│                                  │  (persistence)       │         │
│                                  └──────────────────────┘         │
│                                                                     │
│  Terraform:                                                        │
│  - Workspace: local                                                │
│  - Endpoints configured for LocalStack                             │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Create Todo
```
User Input (Frontend)
    │
    ▼
Client-side Validation
    │
    ▼
POST /todos
    │
    ▼
API Gateway
    │
    ▼
Lambda Handler
    │
    ├─► Server-side Validation
    │   (title required, max 140 chars)
    │   (description max 1000 chars)
    │
    ├─► Generate UUID
    │
    ├─► Set timestamps
    │
    ▼
DynamoDB PutItem
    │
    ▼
Return created todo
    │
    ▼
Frontend updates UI
```

### Update Todo
```
User Edit (Frontend)
    │
    ▼
Client-side Validation
    │
    ▼
PUT /todos/{id}
    │
    ▼
API Gateway
    │
    ▼
Lambda Handler
    │
    ├─► Check if todo exists (GetItem)
    │   │
    │   └─► Return 404 if not found
    │
    ├─► Server-side Validation
    │
    ├─► Update timestamp
    │
    ▼
DynamoDB UpdateItem
    │
    ▼
Return updated todo
    │
    ▼
Frontend updates UI
```

## Security Model

### Frontend
- HTTPS only (CloudFront)
- No authentication (public app)
- Client-side validation
- CORS headers checked by browser

### API
- CORS configured for specific origins
- Input validation on all endpoints
- Structured error responses (no sensitive data)
- Rate limiting (via API Gateway - to be configured)

### Data
- DynamoDB encryption at rest
- S3 encryption at rest
- CloudWatch logs encrypted
- No PII stored

### IAM
- Least-privilege policies
- Lambda can only access specific DynamoDB table
- CloudFront can only access S3 bucket via OAC
- No wildcard permissions

## Scalability

### Horizontal Scaling
- Lambda: Automatic scaling (1000 concurrent executions default)
- DynamoDB: On-demand capacity, auto-scales
- CloudFront: Global edge network
- S3: Unlimited scalability

### Performance
- CloudFront caching reduces origin load
- DynamoDB single-digit millisecond latency
- Lambda cold start: ~200ms
- Lambda warm: ~10ms

## Disaster Recovery

### Backups
- DynamoDB: Point-in-time recovery (prod)
- S3: Versioning enabled
- Infrastructure: Terraform state

### High Availability
- Lambda: Multi-AZ by default
- DynamoDB: Multi-AZ replication
- S3: 99.999999999% durability
- CloudFront: Global distribution

## Monitoring

### Metrics
- Lambda: Invocations, Errors, Duration, Throttles
- API Gateway: Count, Latency, 4XX, 5XX
- DynamoDB: Read/Write capacity, Throttles

### Logs
- Structured JSON logs with requestId
- CloudWatch Logs Insights for queries
- Retention policies per environment

### Alarms (To Be Configured)
- Lambda error rate > 5%
- API Gateway 5XX rate > 1%
- DynamoDB throttling
