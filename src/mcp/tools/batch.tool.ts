import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { BatchService } from "../../core/services/batch.service.js";

export function registerBatchTools(server: McpServer) {
  const service = new BatchService();

  // ---- Task Batch Tools ----

  server.registerTool(
    "dida365_move_task",
    {
      description:
        "Move a task from one project to another.",
      inputSchema: {
        taskId: z.string().describe("The task ID to move"),
        fromProjectId: z.string().describe("Current project ID"),
        toProjectId: z.string().describe("Target project ID"),
      },
    },
    async ({ taskId, fromProjectId, toProjectId }) => {
      try {
        await service.moveTask(taskId, fromProjectId, toProjectId);
        return {
          content: [
            {
              type: "text" as const,
              text: `Task moved from project ${fromProjectId} to ${toProjectId} successfully.`,
            },
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
    "dida365_set_subtask",
    {
      description:
        "Set a task as a subtask of another task.",
      inputSchema: {
        taskId: z.string().describe("The task ID to become a subtask"),
        parentId: z.string().describe("The parent task ID"),
        projectId: z.string().describe("The project ID containing both tasks"),
      },
    },
    async ({ taskId, parentId, projectId }) => {
      try {
        await service.setSubtask(taskId, parentId, projectId);
        return {
          content: [
            {
              type: "text" as const,
              text: `Task ${taskId} is now a subtask of ${parentId}.`,
            },
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
    "dida365_batch_delete_tasks",
    {
      description:
        "Delete multiple tasks at once.",
      inputSchema: {
        items: z
          .array(
            z.object({
              taskId: z.string().describe("Task ID"),
              projectId: z.string().describe("Project ID"),
            })
          )
          .describe("Array of {taskId, projectId} pairs to delete"),
      },
    },
    async ({ items }) => {
      try {
        await service.deleteTasks(items);
        return {
          content: [
            {
              type: "text" as const,
              text: `${items.length} task(s) deleted successfully.`,
            },
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

  // ---- Project Batch Tools ----

  server.registerTool(
    "dida365_batch_create_project",
    {
      description:
        "Create a new project via batch API.",
      inputSchema: {
        name: z.string().describe("Project name"),
        color: z.string().optional().describe("Project color"),
        groupId: z.string().optional().describe("Project group/folder ID"),
        viewMode: z
          .string()
          .optional()
          .describe("View mode (e.g., 'list', 'kanban')"),
      },
    },
    async ({ name, color, groupId, viewMode }) => {
      try {
        await service.createProject({
          id: "",
          name,
          color,
          groupId,
          viewMode,
        });
        return {
          content: [
            {
              type: "text" as const,
              text: `Project "${name}" created successfully.`,
            },
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
    "dida365_batch_delete_projects",
    {
      description:
        "Delete multiple projects. This is destructive!",
      inputSchema: {
        projectIds: z
          .array(z.string())
          .describe("Array of project IDs to delete"),
      },
    },
    async ({ projectIds }) => {
      try {
        await service.deleteProjects(projectIds);
        return {
          content: [
            {
              type: "text" as const,
              text: `${projectIds.length} project(s) deleted successfully.`,
            },
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

  // ---- Project Group/Folder Tools ----

  server.registerTool(
    "dida365_create_project_group",
    {
      description:
        "Create a project group (folder) to organize projects.",
      inputSchema: {
        name: z.string().describe("Group/folder name"),
      },
    },
    async ({ name }) => {
      try {
        await service.createProjectGroup({ name });
        return {
          content: [
            {
              type: "text" as const,
              text: `Project group "${name}" created successfully.`,
            },
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
    "dida365_delete_project_groups",
    {
      description:
        "Delete project groups (folders).",
      inputSchema: {
        groupIds: z
          .array(z.string())
          .describe("Array of group IDs to delete"),
      },
    },
    async ({ groupIds }) => {
      try {
        await service.deleteProjectGroups(groupIds);
        return {
          content: [
            {
              type: "text" as const,
              text: `${groupIds.length} project group(s) deleted successfully.`,
            },
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
