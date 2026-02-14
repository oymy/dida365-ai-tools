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

This is a dual-mode application providing both an **MCP Server** (26 tools, stdio transport) and a **CLI** (30+ subcommands via Commander.js) for managing Dida365 (滴答清单/TickTick CN) tasks. Both interfaces share a unified core layer.

### Three-Layer Structure

```
src/core/     →  Shared business logic (API client, auth, services, types)
src/mcp/      →  Thin MCP protocol wrapper around core (tool registrations)
src/cli/      →  Thin Commander.js wrapper around core (command registrations)
```

**Critical rule**: `core/` must never depend on `mcp/` or `cli/`. Dependencies flow one way: `mcp/` → `core/` and `cli/` → `core/`.

### Core Layer

- **api-client.ts** — Central HTTP layer with 19 endpoints across two API bases:
  - Open API (`https://api.dida365.com/open/v1/`) — 7 official, stable endpoints
  - Private API (`https://api.dida365.com/api/v2/`) — 12 unofficial endpoints that mimic the web client (includes device headers)
- **auth.ts** — OAuth 2.0 flow (authorize URL → code exchange → Bearer token)
- **token-store.ts** — Persists tokens to `~/.dida365/token.json`
- **config.ts** — Loads `DIDA365_CLIENT_ID`, `DIDA365_CLIENT_SECRET`, `DIDA365_REDIRECT_URI` from `.env` or environment
- **types.ts** — 15 TypeScript interfaces for all domain models and API payloads
- **services/** — Feature-organized business logic:
  - `completed.service.ts` — Completed task queries (by date/range/today/week)
  - `sync.service.ts` — Full sync and user settings
  - `tag.service.ts` — Tag CRUD, renaming, merging, nesting
  - `batch.service.ts` — Bulk operations on tasks, projects, folders

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
| Library import | `build/core/api-client.js` | Programmatic API |

## Key Conventions

- **ES Modules** throughout (`"type": "module"` in package.json)
- **TypeScript strict mode** — no implicit any
- **Node 16 module resolution** (tsconfig `module: "Node16"`)
- Private API endpoints should be clearly marked as experimental
- MCP tool handlers return `{ content: [...], isError?: true }` format
- CLI commands use `formatError()` + `process.exit(1)` for error handling
