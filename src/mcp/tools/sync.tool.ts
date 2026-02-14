import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SyncService } from "../../core/services/sync.service.js";

export function registerSyncTools(server: McpServer) {
  const service = new SyncService();

  server.registerTool(
    "dida365_sync",
    {
      description:
        "Full sync - fetch all tasks, projects, project groups, and tags from Dida365. " +
        "Returns everything in one request. Useful for getting a complete overview. " +
        "WARNING: Uses private API.",
    },
    async () => {
      try {
        const result = await service.fullSync();
        const summary = {
          summary: `Synced: ${result.tasks.length} tasks, ${result.projects.length} projects, ${result.tags.length} tags, ${result.projectGroups.length} folders`,
          inboxId: result.inboxId,
          projects: result.projects.map((p) => ({
            id: p.id,
            name: p.name,
          })),
          projectGroups: result.projectGroups.map((g) => ({
            id: g.id,
            name: g.name,
          })),
          tags: result.tags.map((t) => ({ name: t.name, color: t.color })),
          taskCount: result.tasks.length,
          tasks: result.tasks.map((t) => ({
            id: t.id,
            title: t.title,
            projectId: t.projectId,
            status: t.status,
            priority: t.priority,
            tags: t.tags,
            dueDate: t.dueDate,
          })),
        };
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(summary, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );

  server.registerTool(
    "dida365_get_settings",
    {
      description:
        "Get user settings including timezone, date format, etc. WARNING: Uses private API.",
    },
    async () => {
      try {
        const settings = await service.getSettings();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(settings, null, 2) },
          ],
        };
      } catch (error) {
        return {
          content: [
            {
              type: "text" as const,
              text: `Error: ${error instanceof Error ? error.message : String(error)}`,
            },
          ],
          isError: true,
        };
      }
    }
  );
}
