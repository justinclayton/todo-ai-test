import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  ...(process.env.DYNAMODB_ENDPOINT && { endpoint: process.env.DYNAMODB_ENDPOINT })
});

const docClient = DynamoDBDocumentClient.from(client);

const TABLE_NAME = process.env.TABLE_NAME;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';
const STAGE = process.env.STAGE || 'dev';

// Validation helpers
export function validateTodoInput(data, isUpdate = false) {
  const errors = [];
  
  if (!isUpdate && (!data.title || typeof data.title !== 'string')) {
    errors.push('title is required and must be a string');
  }
  
  if (data.title !== undefined) {
    if (typeof data.title !== 'string') {
      errors.push('title must be a string');
    } else if (data.title.length === 0) {
      errors.push('title cannot be empty');
    } else if (data.title.length > 140) {
      errors.push('title must be 140 characters or less');
    }
  }
  
  if (data.description !== undefined && data.description !== null) {
    if (typeof data.description !== 'string') {
      errors.push('description must be a string');
    } else if (data.description.length > 1000) {
      errors.push('description must be 1000 characters or less');
    }
  }
  
  if (data.completed !== undefined && typeof data.completed !== 'boolean') {
    errors.push('completed must be a boolean');
  }
  
  return errors;
}

// Logging helper
export function createLogger(requestContext) {
  const requestId = requestContext?.requestId || 'unknown';
  const route = requestContext?.routeKey || requestContext?.resourcePath || 'unknown';
  
  return {
    info: (message, meta = {}) => {
      console.log(JSON.stringify({
        level: 'info',
        message,
        requestId,
        route,
        stage: STAGE,
        timestamp: new Date().toISOString(),
        ...meta
      }));
    },
    error: (message, error, meta = {}) => {
      console.error(JSON.stringify({
        level: 'error',
        message,
        requestId,
        route,
        stage: STAGE,
        timestamp: new Date().toISOString(),
        error: error?.message || error,
        stack: error?.stack,
        ...meta
      }));
    }
  };
}

// Response helper
export function createResponse(statusCode, body, additionalHeaders = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
      ...additionalHeaders
    },
    body: JSON.stringify(body)
  };
}

// Handler functions
export async function listTodos(logger, lastEvaluatedKey = null, limit = 50) {
  logger.info('Listing todos', { limit, hasLastKey: !!lastEvaluatedKey });
  
  const params = {
    TableName: TABLE_NAME,
    Limit: limit
  };
  
  if (lastEvaluatedKey) {
    params.ExclusiveStartKey = lastEvaluatedKey;
  }
  
  try {
    const result = await docClient.send(new ScanCommand(params));
    
    logger.info('Listed todos successfully', { count: result.Items?.length || 0 });
    
    return createResponse(200, {
      items: result.Items || [],
      nextToken: result.LastEvaluatedKey ? JSON.stringify(result.LastEvaluatedKey) : null
    });
  } catch (error) {
    logger.error('Error listing todos', error);
    return createResponse(500, { error: 'Internal server error', message: 'Failed to list todos' });
  }
}

export async function getTodo(logger, id) {
  logger.info('Getting todo', { id });
  
  try {
    const result = await docClient.send(new GetCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));
    
    if (!result.Item) {
      logger.info('Todo not found', { id });
      return createResponse(404, { error: 'Not found', message: 'Todo not found' });
    }
    
    logger.info('Retrieved todo successfully', { id });
    return createResponse(200, result.Item);
  } catch (error) {
    logger.error('Error getting todo', error, { id });
    return createResponse(500, { error: 'Internal server error', message: 'Failed to get todo' });
  }
}

export async function createTodo(logger, data) {
  logger.info('Creating todo', { title: data.title });
  
  const validationErrors = validateTodoInput(data);
  if (validationErrors.length > 0) {
    logger.info('Validation failed', { errors: validationErrors });
    return createResponse(400, { error: 'Validation failed', details: validationErrors });
  }
  
  const now = new Date().toISOString();
  const todo = {
    id: uuidv4(),
    title: data.title,
    description: data.description || '',
    completed: data.completed || false,
    createdAt: now,
    updatedAt: now
  };
  
  try {
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: todo
    }));
    
    logger.info('Created todo successfully', { id: todo.id });
    return createResponse(201, todo);
  } catch (error) {
    logger.error('Error creating todo', error);
    return createResponse(500, { error: 'Internal server error', message: 'Failed to create todo' });
  }
}

export async function updateTodo(logger, id, data) {
  logger.info('Updating todo', { id });
  
  const validationErrors = validateTodoInput(data, true);
  if (validationErrors.length > 0) {
    logger.info('Validation failed', { errors: validationErrors });
    return createResponse(400, { error: 'Validation failed', details: validationErrors });
  }
  
  // First check if the todo exists
  const getResult = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id }
  }));
  
  if (!getResult.Item) {
    logger.info('Todo not found', { id });
    return createResponse(404, { error: 'Not found', message: 'Todo not found' });
  }
  
  const updates = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};
  
  if (data.title !== undefined) {
    updates.push('#title = :title');
    expressionAttributeValues[':title'] = data.title;
    expressionAttributeNames['#title'] = 'title';
  }
  
  if (data.description !== undefined) {
    updates.push('#description = :description');
    expressionAttributeValues[':description'] = data.description;
    expressionAttributeNames['#description'] = 'description';
  }
  
  if (data.completed !== undefined) {
    updates.push('#completed = :completed');
    expressionAttributeValues[':completed'] = data.completed;
    expressionAttributeNames['#completed'] = 'completed';
  }
  
  updates.push('#updatedAt = :updatedAt');
  expressionAttributeValues[':updatedAt'] = new Date().toISOString();
  expressionAttributeNames['#updatedAt'] = 'updatedAt';
  
  try {
    const result = await docClient.send(new UpdateCommand({
      TableName: TABLE_NAME,
      Key: { id },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: 'ALL_NEW'
    }));
    
    logger.info('Updated todo successfully', { id });
    return createResponse(200, result.Attributes);
  } catch (error) {
    logger.error('Error updating todo', error, { id });
    return createResponse(500, { error: 'Internal server error', message: 'Failed to update todo' });
  }
}

export async function deleteTodo(logger, id) {
  logger.info('Deleting todo', { id });
  
  // First check if the todo exists
  const getResult = await docClient.send(new GetCommand({
    TableName: TABLE_NAME,
    Key: { id }
  }));
  
  if (!getResult.Item) {
    logger.info('Todo not found', { id });
    return createResponse(404, { error: 'Not found', message: 'Todo not found' });
  }
  
  try {
    await docClient.send(new DeleteCommand({
      TableName: TABLE_NAME,
      Key: { id }
    }));
    
    logger.info('Deleted todo successfully', { id });
    return createResponse(204, null);
  } catch (error) {
    logger.error('Error deleting todo', error, { id });
    return createResponse(500, { error: 'Internal server error', message: 'Failed to delete todo' });
  }
}

// Main handler
export async function handler(event) {
  const logger = createLogger(event.requestContext);
  
  logger.info('Request received', {
    method: event.httpMethod,
    path: event.path,
    resource: event.resource
  });
  
  // Handle CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return createResponse(200, {});
  }
  
  const method = event.httpMethod;
  const path = event.resource || event.path;
  const pathParams = event.pathParameters || {};
  
  try {
    // Route handling
    if (method === 'GET' && path === '/todos') {
      const nextToken = event.queryStringParameters?.nextToken;
      const lastKey = nextToken ? JSON.parse(nextToken) : null;
      return await listTodos(logger, lastKey);
    }
    
    if (method === 'POST' && path === '/todos') {
      const data = JSON.parse(event.body || '{}');
      return await createTodo(logger, data);
    }
    
    if (method === 'GET' && path === '/todos/{id}') {
      return await getTodo(logger, pathParams.id);
    }
    
    if (method === 'PUT' && path === '/todos/{id}') {
      const data = JSON.parse(event.body || '{}');
      return await updateTodo(logger, pathParams.id, data);
    }
    
    if (method === 'DELETE' && path === '/todos/{id}') {
      return await deleteTodo(logger, pathParams.id);
    }
    
    // Route not found
    logger.info('Route not found', { method, path });
    return createResponse(404, { error: 'Not found', message: 'Route not found' });
  } catch (error) {
    logger.error('Unhandled error', error);
    return createResponse(500, { error: 'Internal server error', message: 'An unexpected error occurred' });
  }
}
