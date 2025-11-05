#!/bin/bash
set -e

# Integration test script for local environment
# This script tests the API endpoints against LocalStack

API_BASE_URL=${1:-"http://localhost:4566/restapis/todo-api/dev/_user_request_"}

echo "Testing Todo API at: $API_BASE_URL"
echo ""

# Test 1: Create a todo
echo "Test 1: Create a todo"
CREATE_RESPONSE=$(curl -s -X POST "$API_BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Todo","description":"This is a test","completed":false}')

TODO_ID=$(echo $CREATE_RESPONSE | grep -o '"id":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TODO_ID" ]; then
  echo "❌ Failed to create todo"
  echo "Response: $CREATE_RESPONSE"
  exit 1
fi

echo "✓ Created todo with ID: $TODO_ID"
echo ""

# Test 2: List todos
echo "Test 2: List todos"
LIST_RESPONSE=$(curl -s "$API_BASE_URL/todos")

if echo "$LIST_RESPONSE" | grep -q "$TODO_ID"; then
  echo "✓ Todo found in list"
else
  echo "❌ Todo not found in list"
  echo "Response: $LIST_RESPONSE"
  exit 1
fi
echo ""

# Test 3: Get specific todo
echo "Test 3: Get specific todo"
GET_RESPONSE=$(curl -s "$API_BASE_URL/todos/$TODO_ID")

if echo "$GET_RESPONSE" | grep -q "Test Todo"; then
  echo "✓ Retrieved todo successfully"
else
  echo "❌ Failed to retrieve todo"
  echo "Response: $GET_RESPONSE"
  exit 1
fi
echo ""

# Test 4: Update todo
echo "Test 4: Update todo"
UPDATE_RESPONSE=$(curl -s -X PUT "$API_BASE_URL/todos/$TODO_ID" \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Todo","completed":true}')

if echo "$UPDATE_RESPONSE" | grep -q "Updated Todo"; then
  echo "✓ Updated todo successfully"
else
  echo "❌ Failed to update todo"
  echo "Response: $UPDATE_RESPONSE"
  exit 1
fi
echo ""

# Test 5: Verify update
echo "Test 5: Verify update"
VERIFY_RESPONSE=$(curl -s "$API_BASE_URL/todos/$TODO_ID")

if echo "$VERIFY_RESPONSE" | grep -q '"completed":true'; then
  echo "✓ Todo updated correctly"
else
  echo "❌ Todo not updated correctly"
  echo "Response: $VERIFY_RESPONSE"
  exit 1
fi
echo ""

# Test 6: Delete todo
echo "Test 6: Delete todo"
DELETE_RESPONSE=$(curl -s -w "\n%{http_code}" -X DELETE "$API_BASE_URL/todos/$TODO_ID")
HTTP_CODE=$(echo "$DELETE_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "204" ]; then
  echo "✓ Deleted todo successfully"
else
  echo "❌ Failed to delete todo (HTTP $HTTP_CODE)"
  exit 1
fi
echo ""

# Test 7: Verify deletion
echo "Test 7: Verify deletion"
VERIFY_DELETE=$(curl -s -w "\n%{http_code}" "$API_BASE_URL/todos/$TODO_ID")
HTTP_CODE=$(echo "$VERIFY_DELETE" | tail -n1)

if [ "$HTTP_CODE" = "404" ]; then
  echo "✓ Todo successfully deleted"
else
  echo "❌ Todo still exists (HTTP $HTTP_CODE)"
  exit 1
fi
echo ""

# Test 8: Validation - Empty title
echo "Test 8: Test validation - Empty title"
VALIDATION_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d '{"title":"","description":"Should fail"}')
HTTP_CODE=$(echo "$VALIDATION_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ]; then
  echo "✓ Validation working correctly"
else
  echo "❌ Validation not working (HTTP $HTTP_CODE)"
  exit 1
fi
echo ""

# Test 9: Validation - Title too long
echo "Test 9: Test validation - Title too long"
LONG_TITLE=$(printf 'a%.0s' {1..141})
VALIDATION_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$API_BASE_URL/todos" \
  -H "Content-Type: application/json" \
  -d "{\"title\":\"$LONG_TITLE\"}")
HTTP_CODE=$(echo "$VALIDATION_RESPONSE" | tail -n1)

if [ "$HTTP_CODE" = "400" ]; then
  echo "✓ Length validation working correctly"
else
  echo "❌ Length validation not working (HTTP $HTTP_CODE)"
  exit 1
fi
echo ""

echo "========================================="
echo "✅ All integration tests passed!"
echo "========================================="
