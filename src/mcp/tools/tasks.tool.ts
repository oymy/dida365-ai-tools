import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import {
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from "../../core/api-client.js";

export function registerTaskTools(server: McpServer) {
  server.registerTool(
    "dida365_get_task",
    {
      description: "Get details of a specific task by its project ID and task ID.",
      inputSchema: {
        projectId: z.string().describe("The project ID the task belongs to"),
        taskId: z.string().describe("The task ID"),
      },
    },
    async ({ projectId, taskId }) => {
      const task = await getTask(projectId, taskId);
      return {
        content: [{ type: "text" as const, text: JSON.stringify(task, null, 2) }],
      };
    }
  );

  server.registerTool(
    "dida365_create_task",
    {
      description:
        "Create a new task in Dida365. Requires title and projectId. " +
        "Optional: content, desc, startDate, dueDate, priority (0=none,1=low,3=medium,5=high), allDay, timeZone.",
      inputSchema: {
        title: z.string().describe("The task title"),
        projectId: z.string().describe("The project ID to create the task in"),
        content: z.string().optional().describe("Task content/notes"),
        desc: z.string().optional().describe("Task description"),
        startDate: z.string().optional().describe("Start date in ISO 8601 format"),
        dueDate: z.string().optional().describe("Due date in ISO 8601 format"),
        priority: z.number().optional().describe("Priority: 0=none, 1=low, 3=medium, 5=high"),
        allDay: z.boolean().optional().describe("Whether this is an all-day task"),
        timeZone: z.string().optional().describe("Time zone, e.g. 'Asia/Shanghai'"),
      },
    },
    async (params) => {
      const task = await createTask(params);
      return {
        content: [{ type: "text" as const, text: `Task created successfully:\n${JSON.stringify(task, null, 2)}` }],
      };
    }
  );

  server.registerTool(
    "dida365_update_task",
    {
      description:
        "Update an existing task. Requires taskId and projectId. Pass any fields to update.",
      inputSchema: {
        taskId: z.string().describe("The task ID to update"),
        projectId: z.string().describe("The project ID the task belongs to"),
        title: z.string().optional().describe("New task title"),
        content: z.string().optional().describe("New task content/notes"),
        desc: z.string().optional().describe("New task description"),
        startDate: z.string().optional().describe("New start date (ISO 8601)"),
        dueDate: z.string().optional().describe("New due date (ISO 8601)"),
        priority: z.number().optional().describe("Priority: 0=none, 1=low, 3=medium, 5=high"),
        allDay: z.boolean().optional().describe("Whether this is an all-day task"),
        timeZone: z.string().optional().describe("Time zone"),
      },
    },
    async ({ taskId, projectId, ...rest }) => {
      const task = await updateTask(taskId, { id: taskId, projectId, ...rest });
      return {
        content: [{ type: "text" as const, text: `Task updated successfully:\n${JSON.stringify(task, null, 2)}` }],
      };
    }
  );

  server.registerTool(
    "dida365_complete_task",
    {
      description: "Mark a task as complete.",
      inputSchema: {
        projectId: z.string().describe("The project ID the task belongs to"),
        taskId: z.string().describe("The task ID to complete"),
      },
    },
    async ({ projectId, taskId }) => {
      await completeTask(projectId, taskId);
      return {
        content: [{ type: "text" as const, text: `Task ${taskId} has been marked as complete.` }],
      };
    }
  );

  server.registerTool(
    "dida365_delete_task",
    {
      description: "Delete a task permanently. This cannot be undone.",
      inputSchema: {
        projectId: z.string().describe("The project ID the task belongs to"),
        taskId: z.string().describe("The task ID to delete"),
      },
    },
    async ({ projectId, taskId }) => {
      await deleteTask(projectId, taskId);
      return {
        content: [{ type: "text" as const, text: `Task ${taskId} has been deleted.` }],
      };
    }
  );
}
