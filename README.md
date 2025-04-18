# Quizlet Web

A modern web application for Quizlet, built with Next.js and NX.

## Project Structure

This is a monorepo managed by NX with the following projects:

- `web`: Next.js application with server-side rendering
- `ui-components`: Shared UI component library

## Prerequisites

- Node.js (v16 or later)
- npm (v7 or later)

## Getting Started

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start the Next.js development server
npm run web:serve

# Start the UI components development server
npm run ui-components:serve
```

### Building

```bash
# Build the Next.js application
npm run web:build

# Build the UI components library
npm run ui-components:build
```

### Testing

```bash
# Run tests for all projects
npm run test

# Run tests for a specific project
npm run web:test
npm run ui-components:test
```

### Linting

```bash
# Lint all projects
npm run lint

# Lint a specific project
npm run web:lint
npm run ui-components:lint
```

## NX Commands

NX provides powerful tools for managing monorepos. Here are some useful commands:

```bash
# Generate a new project
npx nx g @nx/next:app my-app

# Generate a new library
npx nx g @nx/react:lib my-lib

# Generate a new component
npx nx g @nx/react:component my-component --project=ui-components

# Run a specific target for a project
npx nx run web:build
npx nx run ui-components:test

# View dependency graph
npx nx graph

# Run affected commands (only run on changed projects)
npx nx affected:test
npx nx affected:build
npx nx affected:lint
```

## Project Configuration

### Web Application

The Next.js application is configured in `web/project.json` and uses the following settings:

- Development server runs on port 4200
- API routes are configured to proxy requests to the Go backend
- Authentication is handled via HTTP-only cookies

### UI Components

The UI components library is configured in `ui-components/project.json` and uses:

- Tailwind CSS for styling
- React for component development
- TypeScript for type safety

## Authentication Flow

The application uses a secure authentication flow:

1. User logs in via the login page
2. Next.js API routes handle token storage in HTTP-only cookies
3. Protected routes check for valid tokens
4. Token refresh is handled automatically when tokens expire

## Deployment

```bash
# Build for production
npm run web:build

# Start production server
npm run web:start
```

## Contributing

1. Create a feature branch: `git checkout -b feature/my-feature`
2. Commit your changes: `git commit -m 'Add some feature'`
3. Push to the branch: `git push origin feature/my-feature`
4. Submit a pull request

## License

This project is licensed under the MIT License.
