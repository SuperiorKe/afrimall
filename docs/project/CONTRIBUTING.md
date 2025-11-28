# 🤝 Contributing to Afrimall

Thank you for your interest in contributing to Afrimall! This document provides guidelines and information for contributors.

## 🚀 Quick Start for Contributors

### 1. Fork & Clone
```bash
# Fork the repository on GitHub, then clone your fork
git clone https://github.com/yourusername/afrimall.git
cd afrimall

# Add upstream remote
git remote add upstream https://github.com/originalowner/afrimall.git
```

### 2. Install Dependencies
```bash
# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local

# Generate types
pnpm run generate:types
```

### 3. Start Development
```bash
# Start development server
pnpm run dev

# In another terminal, start database (if using Docker)
docker-compose up -d
```

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict typing, avoid `any` types
- **React**: Use functional components with hooks
- **Styling**: Use Tailwind CSS utilities, avoid custom CSS
- **Naming**: Use descriptive, camelCase for variables, PascalCase for components

### File Structure
```
src/
├── components/          # Reusable UI components
│   ├── ecommerce/      # E-commerce specific components
│   └── ui/             # Base UI components
├── app/                # Next.js pages and API routes
├── collections/        # Payload CMS collections
├── utilities/          # Helper functions
└── types/              # TypeScript definitions
```

### Component Guidelines
- **Props**: Define clear TypeScript interfaces
- **Styling**: Use Tailwind classes, create reusable variants
- **Accessibility**: Include proper ARIA labels and keyboard navigation
- **Responsive**: Mobile-first design approach

### API Guidelines
- **Error Handling**: Use consistent error response format
- **Validation**: Validate all inputs using Zod schemas
- **Logging**: Use structured logging with appropriate levels
- **Documentation**: Document all API endpoints

## 🧪 Testing

### Running Tests
```bash
# Run all tests
pnpm run test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

### Writing Tests
- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database operations
- **E2E Tests**: Test complete user workflows

### Test Structure
```typescript
// Example test file
describe('ProductCard Component', () => {
  it('should render product information correctly', () => {
    // Test implementation
  })
  
  it('should handle add to cart action', () => {
    // Test implementation
  })
})
```

## 🔧 Development Workflow

### 1. Create Feature Branch
```bash
git checkout -b feature/amazing-feature
# or
git checkout -b fix/bug-description
# or
git checkout -b docs/update-readme
```

### 2. Make Changes
- Write clean, readable code
- Add tests for new functionality
- Update documentation as needed
- Follow the existing code style

### 3. Commit Changes
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat: add product search functionality"

# Push to your fork
git push origin feature/amazing-feature
```

### 4. Create Pull Request
- Open a pull request on GitHub
- Fill out the PR template
- Link any related issues
- Request review from maintainers

## 📝 Commit Convention

We use [Conventional Commits](https://www.conventionalcommits.org/) for commit messages:

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples
```bash
feat: add product filtering by category
fix: resolve cart item quantity update issue
docs: update API documentation
style: format code with prettier
refactor: extract cart logic to custom hook
test: add unit tests for product utilities
chore: update dependencies
```

## 🐛 Bug Reports

### Before Reporting
1. Check if the bug has already been reported
2. Try to reproduce the bug
3. Check the latest version

### Bug Report Template
```markdown
## Bug Description
Brief description of the bug

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen

## Actual Behavior
What actually happened

## Environment
- OS: [e.g. Windows 10]
- Browser: [e.g. Chrome 91]
- Node.js: [e.g. 18.17.0]
- Afrimall version: [e.g. 1.0.0]

## Additional Context
Any other relevant information
```

## ✨ Feature Requests

### Before Requesting
1. Check if the feature has already been requested
2. Consider if it fits the project's scope
3. Think about implementation complexity

### Feature Request Template
```markdown
## Feature Description
Brief description of the feature

## Use Case
Why is this feature needed?

## Proposed Solution
How should this feature work?

## Alternatives Considered
What other solutions did you consider?

## Additional Context
Any other relevant information
```

## 🔍 Code Review Process

### For Contributors
- Address all review comments
- Keep commits focused and atomic
- Respond to feedback constructively
- Update documentation as needed

### For Reviewers
- Be constructive and helpful
- Focus on code quality and maintainability
- Check for security issues
- Ensure tests are adequate

## 📚 Documentation

### Updating Documentation
- Update README.md for significant changes
- Add JSDoc comments for new functions
- Update API documentation for new endpoints
- Include examples in documentation

### Documentation Standards
- Use clear, concise language
- Include code examples
- Keep documentation up to date
- Use proper markdown formatting

## 🚀 Release Process

### Version Numbering
We use [Semantic Versioning](https://semver.org/):
- `MAJOR`: Breaking changes
- `MINOR`: New features (backward compatible)
- `PATCH`: Bug fixes (backward compatible)

### Release Checklist
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped
- [ ] Release notes prepared

## 🆘 Getting Help

### Resources
- **Issues**: [GitHub Issues](https://github.com/yourusername/afrimall/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/afrimall/discussions)
- **Documentation**: Check the `docs/` folder
- **Code Examples**: Look at existing code

### Community Guidelines
- Be respectful and inclusive
- Help others learn and grow
- Share knowledge and experience
- Follow the code of conduct

## 📄 License

By contributing to Afrimall, you agree that your contributions will be licensed under the MIT License.

## 🙏 Recognition

Contributors will be recognized in:
- README.md contributors section
- Release notes
- Project documentation

Thank you for contributing to Afrimall! 🚀
