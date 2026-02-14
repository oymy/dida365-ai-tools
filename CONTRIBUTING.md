# Contributing to dida365-ai-tools

Thank you for your interest in contributing! This guide will help you get started.

## Development Setup

```bash
# Clone the repository
git clone https://github.com/YOUR_GITHUB_USERNAME/dida365-ai-tools.git
cd dida365-ai-tools

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env with your Dida365 API credentials

# Build
npm run build

# Watch mode
npm run dev
```

## Getting Dida365 API Credentials

1. Go to [Dida365 Developer Platform](https://developer.dida365.com/)
2. Register your application
3. Get your Client ID and Client Secret
4. Set redirect URI to `http://localhost:8080/callback`

## Project Structure

```
src/
├── core/           # Shared core (API client, services, types)
├── mcp/            # MCP Server entry point and tools
└── cli/            # CLI entry point and commands
```

- **core/** - Business logic shared by both MCP and CLI
- **mcp/** - MCP Server tools that wrap core services
- **cli/** - Commander.js commands that wrap core services

## Making Changes

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Build and test: `npm run build`
5. Commit with clear messages
6. Push and open a Pull Request

## Guidelines

- Keep the dual-entry architecture: changes to business logic go in `core/`, not in `mcp/` or `cli/`
- TypeScript strict mode is enabled - no `any` types without good reason
- When adding a new API endpoint, add it to all three layers: `api-client.ts` -> service -> both MCP tool and CLI command
- Private API endpoints should be clearly marked as experimental

## Reporting Issues

- Use GitHub Issues
- Include your Node.js version and OS
- For API issues, specify whether it's an Official or Private API endpoint

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
