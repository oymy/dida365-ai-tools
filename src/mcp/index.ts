#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { registerAuthTool } from "./tools/auth.tool.js";
import { registerProjectTools } from "./tools/projects.tool.js";
import { registerTaskTools } from "./tools/tasks.tool.js";
import { registerCompletedTools } from "./tools/completed.tool.js";
import { registerSyncTools } from "./tools/sync.tool.js";
import { registerTagTools } from "./tools/tag.tool.js";
import { registerBatchTools } from "./tools/batch.tool.js";

const server = new McpServer({
  name: "dida365-ai-tools",
  version: "3.0.0",
});

registerAuthTool(server);
registerProjectTools(server);
registerTaskTools(server);
registerCompletedTools(server);
registerSyncTools(server);
registerTagTools(server);
registerBatchTools(server);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[dida365-ai-tools] Server running on stdio");
}

main().catch((error) => {
  console.error("[dida365-ai-tools] Fatal error:", error);
  process.exit(1);
});
