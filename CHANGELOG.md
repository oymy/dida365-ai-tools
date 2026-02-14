# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2026-02-14

### Removed
- Open API and OAuth 2.0 authentication flow
- `dotenv` dependency
- `.env.example` configuration file

### Changed
- Unified all operations to use private API with cookie authentication
- Simplified auth: `dida365 auth cookie <token>` replaces the OAuth login/callback flow
- Simplified `task show`: now only requires `<taskId>` (no longer needs `<projectId>`)

## [2.0.0] - 2025-02-14

### Added
- **CLI mode** - Full command-line interface with Commander.js (30+ commands)
- **Dual-entry architecture** - Shared core layer with separate MCP and CLI entry points
- **12 Private API endpoints** - Borrowed from [ticktick-py](https://github.com/lazeroffmichael/ticktick-py)
  - Completed task queries by date/range
  - Full sync (batch/check)
  - User settings and timezone
  - Tag management (CRUD, rename, merge)
  - Batch operations (tasks, projects, project groups)
- **26 MCP tools** total (8 official + 18 private)
- **7 CLI command groups**: auth, project, task, completed, sync, tag, batch

### Changed
- Renamed project from `dida365-mcp` to `dida365-ai-tools`
- Restructured project from flat layout to `core/` + `mcp/` + `cli/`
- Extended `Dida365Task` and `Dida365Project` types with additional fields

## [1.0.0] - 2025-02-08

### Added
- Initial MCP Server with Official Open API support
- OAuth 2.0 authentication flow
- Project management (list, get with tasks)
- Task management (create, read, update, complete, delete)
- Token persistence in `~/.dida365/`
