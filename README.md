# AWS Amplify Gen 2 Todo Application

A production-ready Todo application built with AWS Amplify Gen 2, React (TypeScript), and Tailwind CSS. Features real-time synchronization, offline support, and comprehensive authentication.

## Features

- ✅ **Authentication**: Email and password sign-up/sign-in with email verification (AWS Cognito)
- ✅ **Real-time Updates**: GraphQL subscriptions for live data synchronization across sessions
- ✅ **Offline Support**: Automatic mutation queuing and conflict resolution when offline
- ✅ **Optimistic UI**: Instant feedback for create, update, delete, and toggle operations
- ✅ **Advanced Filtering**: Filter by status (All, Active, Completed) with search and sort
- ✅ **Accessibility**: Full keyboard navigation, ARIA labels, and focus management
- ✅ **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- ✅ **Type Safety**: Full TypeScript support with Amplify Gen 2 code-first backend

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Backend**: AWS Amplify Gen 2 (code-first)
- **Auth**: Amazon Cognito
- **API**: AWS AppSync (GraphQL)
- **Database**: Amazon DynamoDB
- **Styling**: Tailwind CSS
- **Testing**: Vitest, React Testing Library
- **CI/CD**: GitHub Actions + Amplify Hosting

## Project Structure

```
.
├── amplify/
│   ├── auth/
│   │   └── resource.ts          # Auth configuration
│   ├── data/
│   │   └── resource.ts          # Data model and schema
│   └── backend.ts               # Backend entry point
├── src/
│   ├── components/              # React components
│   │   ├── AuthWrapper.tsx      # Authentication wrapper
│   │   ├── NetworkStatus.tsx    # Offline/online indicator
│   │   ├── TodoForm.tsx         # Todo create/edit form
│   │   ├── TodoItem.tsx         # Individual todo item
│   │   ├── TodoList.tsx         # Todo list with loading states
│   │   └── TodoFilters.tsx      # Filter, search, and sort controls
│   ├── hooks/
│   │   ├── useTodos.ts          # Todo CRUD operations with subscriptions
│   │   └── useNetworkStatus.ts  # Network status detection
│   ├── types/
│   │   └── todo.ts              # TypeScript type definitions
│   ├── utils/
│   │   └── validation.ts        # Form validation utilities
│   ├── test/                    # Test files
│   ├── App.tsx                  # Main application component
│   └── main.tsx                 # Application entry point
├── package.json
├── tsconfig.json
└── vite.config.ts
```

## Getting Started

### Prerequisites

- Node.js 18.x or later
- npm or yarn
- AWS Account (for deployment)
- AWS CLI configured (optional, for manual deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd todo-amplify-test
```

2. Install dependencies:
```bash
npm install
```

3. Start the local development server:
```bash
npm run dev
```

The app will be available at `http://localhost:5173`

## Amplify Backend Setup

### Local Sandbox Development

For local development with a cloud sandbox:

```bash
npm run amplify:sandbox
```

This will:
- Deploy a temporary cloud environment
- Generate `amplify_outputs.json` with your backend configuration
- Watch for changes and automatically redeploy

The sandbox is perfect for development and testing without affecting production.

### Deploy to Production

1. **Initialize Amplify Hosting** (one-time setup):
   - Go to AWS Amplify Console
   - Connect your Git repository
   - Amplify will auto-detect the backend configuration

2. **Deploy the backend**:
```bash
npm run amplify:deploy
```

3. **Configure environment variables** in Amplify Console if needed

4. **Push to main branch** - Amplify Hosting will automatically:
   - Build the backend
   - Generate `amplify_outputs.json`
   - Build and deploy the frontend

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests
- `npm run test:ui` - Run tests with UI
- `npm run test:coverage` - Generate test coverage report
- `npm run amplify:sandbox` - Start local Amplify sandbox
- `npm run amplify:deploy` - Deploy to production

## Data Model

The application uses a single `Todo` model with the following schema:

```typescript
{
  id: string              // Auto-generated
  name: string            // Required, 1-100 characters
  description: string     // Optional, up to 1,000 characters
  completed: boolean      // Default: false
  owner: string           // Auto-set from authenticated user
  createdAt: AWSDateTime  // Auto-generated
  updatedAt: AWSDateTime  // Auto-generated
}
```

**Authorization Rules:**
- Owner-based: Users can only create, read, update, and delete their own todos
- Authentication required: No public access

## Key Features Explained

### Real-time Synchronization

The app uses GraphQL subscriptions to keep all sessions in sync:
- When a todo is created, updated, or deleted in one session, all other sessions are automatically updated
- Subscriptions are set up in `useTodos` hook

### Offline Support

- Network status is detected using the browser's online/offline events
- Mutations are queued when offline and automatically synced when back online
- Visual indicator shows connection status and syncing state
- Amplify handles conflict resolution automatically

### Optimistic Updates

All mutations (create, update, delete, toggle) use optimistic updates:
1. UI updates immediately with expected result
2. Mutation is sent to the server
3. If successful, data is replaced with server response
4. If failed, UI rolls back to previous state and shows error

### Accessibility

- Full keyboard navigation support
- ARIA labels and roles throughout
- Focus management for modals and forms
- Color contrast meets WCAG AA standards
- Screen reader friendly

## Testing

The project includes comprehensive tests:

### Unit Tests
- Form validation logic
- Utility functions
- Component rendering and behavior

### Integration Tests
- Todo CRUD operations
- Optimistic updates and rollback
- Filter, search, and sort functionality

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:ui

# Generate coverage report
npm run test:coverage
```

## Environment Variables

The application uses `amplify_outputs.json` which is auto-generated during deployment. For local development with sandbox, this file is created automatically.

No manual environment variable configuration is needed.

## Deployment

### Using Amplify Hosting (Recommended)

1. Push your code to a Git repository (GitHub, GitLab, Bitbucket, or AWS CodeCommit)

2. In AWS Amplify Console:
   - Click "New app" → "Host web app"
   - Connect your repository
   - Amplify will auto-detect the configuration
   - Click "Save and deploy"

3. Amplify will:
   - Build the backend (auth, API, database)
   - Generate configuration
   - Build and deploy the frontend
   - Provide a live URL

### Manual Deployment

```bash
# Deploy backend
npm run amplify:deploy

# Build frontend
npm run build

# The dist/ folder can be deployed to any static hosting service
```

## CI/CD Pipeline

The project is configured for continuous deployment:

1. **On Pull Request**: 
   - Run linting
   - Run type checking
   - Run tests
   - Build preview

2. **On Merge to Main**:
   - Run all checks
   - Deploy backend
   - Build and deploy frontend
   - Generate preview URL

Configure in Amplify Console or using `.github/workflows` for GitHub Actions.

## Troubleshooting

### "Amplify is not configured" Error

Make sure you've run the Amplify sandbox or deployed the backend:
```bash
npm run amplify:sandbox
```

### Build Failures

Ensure all dependencies are installed:
```bash
rm -rf node_modules package-lock.json
npm install
```

### GraphQL/Auth Errors

Check that `amplify_outputs.json` exists and contains valid configuration. Regenerate by running the sandbox or deploying.

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Android)

## Performance

- Lazy loading for optimal bundle size
- Debounced search (300ms)
- Optimistic updates for instant feedback
- Efficient re-renders using React hooks

## Security

- All API requests require authentication
- Owner-based authorization ensures data isolation
- Email verification required before access
- Secure token management via Amplify Auth
- HTTPS enforced in production

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

See LICENSE file for details.

## Support

For issues and questions:
- Check existing GitHub issues
- Review AWS Amplify documentation
- Contact the development team

## Acknowledgments

Built with AWS Amplify Gen 2, showcasing modern serverless application development with code-first infrastructure.

