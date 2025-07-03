# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Essential Commands

### Build and Development
- `pnpm build` - Compile TypeScript to JavaScript (output in `dist/`)
- `pnpm dev` - Run the server in development mode with ts-node
- `pnpm start` - Start the compiled server from `dist/index.js`

### Testing
- `pnpm test` - Run Jest tests from the `tests/` directory
- Tests are configured with ts-jest and target Node.js environment

### Code Quality
- `pnpm lint` - Run Biome linter on `src/` directory
- `pnpm format` - Format code with Biome (writes changes)
- `pnpm check` - Run Biome check and apply fixes automatically

## Project Architecture

### Core Structure
This is a Model Context Protocol (MCP) server that provides Google Analytics 4 data access. The architecture consists of:

**Single Entry Point**: `src/index.ts` contains the entire server implementation using:
- `@modelcontextprotocol/sdk` for MCP server functionality
- `@google-analytics/data` for GA4 API access
- `googleapis` for Google Cloud authentication

**Server Pattern**: The server uses:
- `StdioServerTransport` for communication
- Request handlers for `ListToolsRequestSchema` and `CallToolRequestSchema`
- Environment variable validation on startup

### Tool Implementation
The server exposes 4 main tools through the MCP protocol:

1. **getPageViews** - Page view metrics with optional dimensions
2. **getActiveUsers** - Active and new user counts over time
3. **getEvents** - Event tracking with optional event name filtering
4. **getUserBehavior** - Session duration, bounce rate, and sessions per user

Each tool follows the pattern:
- Date range validation (YYYY-MM-DD format)
- Google Analytics API call via `analyticsDataClient.runReport()`
- JSON response formatting
- Comprehensive error handling with `McpError`

### Environment Requirements
The server requires these environment variables:
- `GOOGLE_CLIENT_EMAIL` - Service account email
- `GOOGLE_PRIVATE_KEY` - Service account private key
- `GA_PROPERTY_ID` - Google Analytics 4 property ID

### Error Handling
- Environment validation occurs at startup
- Date format and range validation for all tools
- Google Analytics API errors are wrapped in `McpError`
- Process-level handlers for uncaught exceptions and unhandled rejections

## Development Notes

### TypeScript Configuration
- Strict mode enabled with comprehensive type checking
- ES2020 target with CommonJS modules
- Source maps and declarations generated
- Tests excluded from compilation

### Code Style
- Biome for linting and formatting
- Double quotes for strings
- Space indentation
- Import organization enabled

### Testing Setup
- Jest with ts-jest preset
- Tests in dedicated `tests/` directory
- Coverage reporting configured for `src/` files
- Node.js test environment