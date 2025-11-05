#!/bin/bash
set -e

echo "Starting LocalStack..."
docker-compose up -d

echo "Waiting for LocalStack to be ready..."
until curl -s http://localhost:4566/_localstack/health | grep -q '"s3": "available"'; do
  echo "Waiting for LocalStack services..."
  sleep 2
done

echo "LocalStack is ready!"
echo ""
echo "Services available at:"
echo "  - LocalStack: http://localhost:4566"
echo ""
echo "Next steps:"
echo "  1. Run './scripts/terraform-local-init.sh' to provision infrastructure"
echo "  2. Run 'cd frontend && npm install && npm run dev' to start the frontend"
