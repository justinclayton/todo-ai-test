# AWS Amplify Gen 2 Todo App - Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Browser                         │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │          React Application (TypeScript)            │    │
│  │                                                     │    │
│  │  Components:                                       │    │
│  │  • AuthWrapper (Cognito UI)                       │    │
│  │  • TodoForm (Create/Edit)                         │    │
│  │  • TodoList (Display + Actions)                   │    │
│  │  • TodoFilters (Search/Filter/Sort)              │    │
│  │  • NetworkStatus (Offline indicator)             │    │
│  │                                                     │    │
│  │  Hooks:                                           │    │
│  │  • useTodos (CRUD + Subscriptions)               │    │
│  │  • useNetworkStatus (Online/Offline)             │    │
│  └────────────────────────────────────────────────────┘    │
│                          │                                   │
│                          │ Amplify Client SDK                │
│                          ▼                                   │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                      AWS Cloud                               │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Amazon Cognito (Authentication)            │  │
│  │  • User Pool for email/password auth                │  │
│  │  • Email verification                                │  │
│  │  • JWT token management                             │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          │ Tokens                            │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           AWS AppSync (GraphQL API)                  │  │
│  │                                                      │  │
│  │  Queries:                                           │  │
│  │  • listTodos (with owner filter)                   │  │
│  │                                                      │  │
│  │  Mutations:                                         │  │
│  │  • createTodo                                       │  │
│  │  • updateTodo                                       │  │
│  │  • deleteTodo                                       │  │
│  │                                                      │  │
│  │  Subscriptions (Real-time):                        │  │
│  │  • onCreate                                         │  │
│  │  • onUpdate                                         │  │
│  │  • onDelete                                         │  │
│  │                                                      │  │
│  │  Authorization:                                     │  │
│  │  • Owner-based access control                      │  │
│  └──────────────────────────────────────────────────────┘  │
│                          │                                   │
│                          │ DynamoDB Operations               │
│                          ▼                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │           Amazon DynamoDB                            │  │
│  │  • Todo items table                                 │  │
│  │  • Automatic timestamps                             │  │
│  │  • Owner attribute for authorization                │  │
│  │  • Encryption at rest                               │  │
│  └──────────────────────────────────────────────────────┘  │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. User Sign-Up/Sign-In

```
User Browser → Amplify Auth UI → Amazon Cognito
     ↓
Email Verification
     ↓
JWT Tokens Issued
     ↓
Stored in Browser (Secure)
```

### 2. Create Todo (with Optimistic Update)

```
User submits form
     ↓
Optimistic: Add temp todo to local state (instant UI update)
     ↓
Mutation: createTodo sent to AppSync
     ↓
AppSync validates authorization (owner check)
     ↓
DynamoDB: Insert record
     ↓
AppSync: Returns created todo with real ID
     ↓
Replace temp todo with real todo in local state
     ↓
Subscription: Notify all connected clients (real-time)
```

### 3. Real-time Updates (Subscriptions)

```
User A creates/updates/deletes todo
     ↓
Mutation sent to AppSync
     ↓
DynamoDB updated
     ↓
AppSync triggers subscription event
     ↓
User B's browser receives event via WebSocket
     ↓
User B's UI automatically updates
```

### 4. Offline Mode

```
User goes offline
     ↓
Network status hook detects offline
     ↓
Show offline indicator
     ↓
User makes changes (creates/updates todos)
     ↓
Optimistic updates applied to local state
     ↓
Amplify queues mutations
     ↓
User comes back online
     ↓
Show syncing indicator
     ↓
Amplify automatically sends queued mutations
     ↓
Receive server responses
     ↓
Update local state with server data
     ↓
Sync complete
```

## Component Hierarchy

```
<App>
  ├── <AuthWrapper>
  │   ├── [Signed Out] → Amplify Authenticator UI
  │   └── [Signed In]
  │       ├── <Header>
  │       │   ├── App Title
  │       │   └── Sign Out Button
  │       └── <Main>
  │           ├── <NetworkStatus> (conditional)
  │           ├── <TodoForm>
  │           ├── <TodoFilters>
  │           │   ├── Stats Counter
  │           │   ├── Search Input
  │           │   ├── Filter Tabs
  │           │   └── Sort Dropdown
  │           └── <TodoList>
  │               ├── [Loading] → Skeletons
  │               ├── [Empty] → Empty State
  │               └── [Data] → <TodoItem> * N
  │                   ├── Checkbox
  │                   ├── Name & Description
  │                   ├── Edit Button
  │                   └── Delete Button
  └── <NetworkStatus> (fixed position)
```

## State Management

### Global State (useTodos hook)

```typescript
{
  todos: Todo[],              // All todos from server
  loading: boolean,           // Initial load state
  error: string | null,       // Error messages
  filter: 'all' | 'active' | 'completed',
  searchQuery: string,
  sortBy: 'createdAt' | 'name',
  stats: {
    total: number,
    completed: number,
    active: number
  }
}
```

### Operations

- **fetchTodos()**: Load all user's todos
- **createTodo(name, desc)**: Create with optimistic update
- **updateTodo(id, updates)**: Update with optimistic update  
- **deleteTodo(id)**: Delete with optimistic update
- **toggleTodo(id, completed)**: Toggle with optimistic update

### Computed Values

- **filteredTodos**: Applied filter, search, and sort in memory

## Authorization Rules

### Amplify Data Schema

```typescript
Todo: a.model({
  name: a.string().required(),
  description: a.string(),
  completed: a.boolean().default(false),
  owner: a.string(),
})
.authorization((allow) => [
  allow.owner()  // Only owner can CRUD their todos
])
```

### How It Works

1. User signs in → JWT token contains user ID (sub)
2. AppSync receives request → Extracts user ID from token
3. For CREATE: Sets `owner` field to user ID automatically
4. For READ/UPDATE/DELETE: Filters by owner field
5. User can only see/modify their own todos

## GraphQL Operations

### Queries

```graphql
query ListTodos {
  listTodos(filter: { owner: { eq: $userId } }) {
    items {
      id
      name
      description
      completed
      owner
      createdAt
      updatedAt
    }
  }
}
```

### Mutations

```graphql
mutation CreateTodo($input: CreateTodoInput!) {
  createTodo(input: $input) {
    id
    name
    description
    completed
    owner
    createdAt
    updatedAt
  }
}
```

### Subscriptions

```graphql
subscription OnCreateTodo($owner: String!) {
  onCreateTodo(filter: { owner: { eq: $owner } }) {
    id
    name
    description
    completed
    owner
    createdAt
    updatedAt
  }
}
```

## Deployment Architecture

```
Developer
    ↓
  Git Push
    ↓
GitHub Repository
    ↓
GitHub Actions (CI)
    ├→ Lint
    ├→ Test
    └→ Build
    ↓
AWS Amplify Console
    ├→ Deploy Backend (CloudFormation)
    │   ├→ Cognito User Pool
    │   ├→ AppSync API
    │   └→ DynamoDB Table
    └→ Deploy Frontend (S3 + CloudFront)
        └→ https://[app-id].amplifyapp.com
```

## Performance Optimizations

1. **Optimistic Updates**: Instant UI feedback
2. **Debounced Search**: Reduce unnecessary re-renders (300ms)
3. **Memo/Callback**: Prevent unnecessary re-renders
4. **Code Splitting**: Lazy load Amplify UI components
5. **GraphQL Subscriptions**: Only receive relevant updates
6. **Client-side Filtering**: Fast filter/search without server calls

## Security Layers

1. **Authentication**: Cognito JWT tokens
2. **Authorization**: Owner-based GraphQL rules
3. **Transport**: HTTPS/WSS only
4. **Validation**: Client and server-side
5. **CORS**: Configured per environment
6. **Rate Limiting**: AWS API Gateway throttling

## Monitoring & Observability

- **CloudWatch Logs**: API requests and errors
- **X-Ray Tracing**: Request flow through AWS services
- **Cognito Metrics**: User sign-ups, sign-ins
- **AppSync Metrics**: Query/mutation performance
- **DynamoDB Metrics**: Read/write capacity

---

This architecture provides a scalable, secure, and maintainable foundation for a production Todo application.
