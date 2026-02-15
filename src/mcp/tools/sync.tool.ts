import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SyncService } from "../../core/services/sync.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

export function registerSyncTools(server: McpServer) {
  const syncService = new SyncService();

  server.registerTool(
    "dida365_sync",
    {
      description:
        "Full sync - fetch all tasks, projects, project groups, and tags from Dida365. " +
        "Returns everything in one request. Useful for getting a complete overview.",
    },
    async () => {
      try {
        const result = await syncService.fullSync();
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
        return successResponse(summary);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_get_settings",
    {
      description:
        "Get user settings including timezone, date format, etc.",
    },
    async () => {
      try {
        const settings = await syncService.getSettings();
        return successResponse(settings);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_get_timezone",
    {
      description:
        "Get user's timezone setting from Dida365.",
    },
    async () => {
      try {
        const timezone = await syncService.getTimezone();
        return successResponse({ timezone });
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
