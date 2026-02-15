import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { CompletedTaskService } from "../../core/services/completed.service.js";
import { errorResponse, successResponse } from "../utils/response.js";

export function registerCompletedTools(server: McpServer) {
  const completedService = new CompletedTaskService();

  server.registerTool(
    "dida365_get_completed_tasks",
    {
      description:
        "Get completed tasks by date or date range.",
      inputSchema: {
        date: z
          .string()
          .optional()
          .describe("Single date in YYYY-MM-DD format (e.g., '2024-01-15')"),
        startDate: z
          .string()
          .optional()
          .describe("Start date in YYYY-MM-DD format (e.g., '2024-01-01')"),
        endDate: z
          .string()
          .optional()
          .describe("End date in YYYY-MM-DD format (e.g., '2024-01-31')"),
        timezone: z
          .string()
          .optional()
          .describe("Timezone (e.g., 'Asia/Shanghai'). Default: Asia/Shanghai"),
      },
    },
    async ({ date, startDate, endDate, timezone }) => {
      try {
        let tasks;

        if (date) {
          // Single date query
          tasks = await completedService.getByDate(new Date(date), timezone);
        } else if (startDate && endDate) {
          // Date range query
          tasks = await completedService.getByDateRange(
            new Date(startDate),
            new Date(endDate),
            timezone
          );
        } else {
          return errorResponse("Please provide either 'date' or both 'startDate' and 'endDate'");
        }

        const summary = `Found ${tasks.length} completed task(s)`;
        const response = {
          summary,
          count: tasks.length,
          tasks: tasks.map((task) => ({
            id: task.id,
            title: task.title,
            completedTime: task.completedTime,
            projectId: task.projectId,
            priority: task.priority,
            tags: task.tags,
          })),
        };

        return successResponse(response);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_get_completed_today",
    {
      description:
        "Get tasks completed today.",
      inputSchema: {
        timezone: z
          .string()
          .optional()
          .describe("Timezone (e.g., 'Asia/Shanghai'). Default: Asia/Shanghai"),
      },
    },
    async ({ timezone }) => {
      try {
        const tasks = await completedService.getToday(timezone);

        const summary = `Found ${tasks.length} task(s) completed today`;
        const response = {
          summary,
          date: new Date().toISOString().split("T")[0],
          count: tasks.length,
          tasks: tasks.map((task) => ({
            id: task.id,
            title: task.title,
            completedTime: task.completedTime,
            projectId: task.projectId,
          })),
        };

        return successResponse(response);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_get_completed_this_week",
    {
      description:
        "Get tasks completed this week (Sunday to Saturday).",
      inputSchema: {
        timezone: z
          .string()
          .optional()
          .describe("Timezone (e.g., 'Asia/Shanghai'). Default: Asia/Shanghai"),
      },
    },
    async ({ timezone }) => {
      try {
        const tasks = await completedService.getThisWeek(timezone);

        const summary = `Found ${tasks.length} task(s) completed this week`;
        const response = {
          summary,
          count: tasks.length,
          tasks: tasks.map((task) => ({
            id: task.id,
            title: task.title,
            completedTime: task.completedTime,
            projectId: task.projectId,
          })),
        };

        return successResponse(response);
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
