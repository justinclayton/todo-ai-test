# Contributing to Todo App

Thank you for your interest in contributing! This document provides guidelines for contributing to the project.

## Development Setup

1. **Fork and clone the repository**
   ```bash
   git clone https://github.com/<your-username>/todo-ai-test.git
   cd todo-ai-test
   ```

2. **Install dependencies**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

3. **Start local development environment**
   ```bash
   ./scripts/start-local.sh
   ./scripts/terraform-local-init.sh
   ```

## Code Standards

### Backend (Node.js)

- Use ES modules (import/export)
- Follow ESLint rules defined in `.eslintrc.cjs`
- Write unit tests for new functionality
- Keep functions small and focused
- Use structured logging

### Frontend (React)

- Use functional components with hooks
- Follow ESLint rules defined in `.eslintrc.cjs`
- Write component tests for new UI components
- Maintain accessibility standards (ARIA labels, semantic HTML)
- Keep components small and reusable

### Infrastructure (Terraform)

- Format code with `terraform fmt`
- Validate with `terraform validate`
- Follow least-privilege IAM policies
- Tag all resources appropriately
- Document complex configurations

## Testing

### Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test

# Integration tests (requires LocalStack running)
./scripts/test-integration.sh
```

### Writing Tests

- Write tests for new features
- Aim for good coverage of business logic
- Test error cases and edge cases
- Use descriptive test names

## Pull Request Process

1. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**
   - Write clear, concise commit messages
   - Keep commits focused on single changes
   - Add tests for new functionality

3. **Test your changes**
   ```bash
   # Run linters
   cd backend && npm run lint
   cd frontend && npm run lint
   
   # Run tests
   cd backend && npm test
   cd frontend && npm test
   
   # Build frontend
   cd frontend && npm run build
   
   # Validate Terraform
   cd infrastructure/terraform
   terraform fmt -check
   terraform validate
   ```

4. **Submit pull request**
   - Fill out the PR template
   - Link related issues
   - Request review from maintainers
   - Address review feedback

## Coding Guidelines

### General

- Write self-documenting code
- Add comments only when necessary to explain "why", not "what"
- Keep functions pure when possible
- Avoid deep nesting
- Handle errors gracefully

### Error Handling

- Return structured error responses
- Log errors with context
- Don't expose sensitive information in error messages
- Validate input at API boundaries

### Security

- Never commit secrets or credentials
- Validate and sanitize all user input
- Follow least-privilege principle for IAM
- Keep dependencies up to date

## Documentation

- Update README.md for user-facing changes
- Document API changes
- Add inline comments for complex logic
- Update architecture diagrams if needed

## Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

Examples:
```
feat(api): add pagination to todos list endpoint

fix(frontend): correct validation error display

docs(readme): add deployment instructions
```

## Release Process

1. Update version numbers
2. Update CHANGELOG.md
3. Create release branch
4. Test thoroughly
5. Create GitHub release
6. Deploy to production

## Getting Help

- Open an issue for bugs or feature requests
- Join discussions for questions
- Review existing issues before creating new ones

## Code of Conduct

- Be respectful and inclusive
- Focus on constructive feedback
- Help others learn and grow
- Follow the Golden Rule

Thank you for contributing! 🎉
