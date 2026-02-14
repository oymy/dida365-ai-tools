import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SyncService } from "../../core/services/sync.service.js";

export function registerProjectTools(server: McpServer) {
  const syncService = new SyncService();

  server.registerTool(
    "dida365_list_projects",
    {
      description:
        "List all projects in your Dida365 account. Returns project IDs, names, and metadata. " +
        "Use this to find the projectId needed for task operations.",
    },
    async () => {
      const projects = await syncService.listProjects();
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(projects, null, 2) },
        ],
      };
    }
  );

  server.registerTool(
    "dida365_get_project_tasks",
    {
      description:
        "Get a project's details and all its tasks. Returns the project info along with all tasks.",
      inputSchema: {
        projectId: z.string().describe("The ID of the project"),
      },
    },
    async ({ projectId }) => {
      const data = await syncService.getProjectWithTasks(projectId);
      return {
        content: [
          { type: "text" as const, text: JSON.stringify(data, null, 2) },
        ],
      };
    }
  );
}
