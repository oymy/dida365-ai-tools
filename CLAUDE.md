# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Development Commands

```bash
npm run build        # Compile TypeScript to build/
npm run dev          # Watch mode (recompiles on changes)
npm run clean        # Remove build/ directory
npm run mcp          # Run MCP server directly (stdio transport)
npm run cli          # Run CLI directly
```

There are no unit tests. CI validates that the project builds and that CLI help runs successfully on Node 18, 20, and 22.

## Architecture

This is a dual-mode application providing both an **MCP Server** (26 tools, stdio transport) and a **CLI** (30+ subcommands via Commander.js) for managing Dida365 (滴答清单/TickTick CN) tasks. Both interfaces share a unified core layer. All API calls go through Dida365's private API with cookie-based authentication.

### Three-Layer Structure

```
src/core/     →  Shared business logic (API client, token store, services, types)
src/mcp/      →  Thin MCP protocol wrapper around core (tool registrations)
src/cli/      →  Thin Commander.js wrapper around core (command registrations)
```

**Critical rule**: `core/` must never depend on `mcp/` or `cli/`. Dependencies flow one way: `mcp/` → `core/` and `cli/` → `core/`.

### Core Layer

- **api-client.ts** — HTTP layer for Dida365 private API (`https://api.dida365.com/api/v2/`). Uses cookie auth (`Cookie: t=<token>`) with web-client-mimicking headers. 12 API endpoints.
- **token-store.ts** — Persists cookie token to `~/.dida365/token.json`
- **types.ts** — TypeScript interfaces for all domain models and API payloads
- **services/** — Feature-organized business logic:
  - `sync.service.ts` — Full sync, user settings, project/task queries via batchCheck
  - `batch.service.ts` — Task CRUD, bulk operations on tasks/projects/folders
  - `completed.service.ts` — Completed task queries (by date/range/today/week)
  - `tag.service.ts` — Tag CRUD, renaming, merging, nesting

### Authentication

Single method: cookie token from browser. User copies the `t` cookie value from dida365.com DevTools and runs `dida365 auth cookie <value>`.

### Adding a New Endpoint

1. Add the HTTP method to `src/core/api-client.ts`
2. Add types to `src/core/types.ts` if needed
3. Add service logic in `src/core/services/`
4. Register an MCP tool in `src/mcp/tools/` (Zod schema for input validation)
5. Register a CLI command in `src/cli/commands/`

### Entry Points & Binaries

| Binary | Entry | Purpose |
|--------|-------|---------|
| `dida365-ai-tools` / `dida365-mcp` | `build/mcp/index.js` | MCP server (stdio) |
| `dida365` | `build/cli/index.js` | CLI tool |

## Key Conventions

- **ES Modules** throughout (`"type": "module"` in package.json)
- **TypeScript strict mode** — no implicit any
- **Node 16 module resolution** (tsconfig `module: "Node16"`)
- MCP tool handlers return `{ content: [...], isError?: true }` format
- CLI commands use `formatError()` + `process.exit(1)` for error handling
