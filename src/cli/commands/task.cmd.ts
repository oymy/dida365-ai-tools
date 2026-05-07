import { Command } from "commander";
import { SyncService } from "../../core/services/sync.service.js";
import { BatchService } from "../../core/services/batch.service.js";
import { formatTask, formatJSON, formatError } from "../utils/output.js";

/**
 * Get today's date range in the given timezone (default Asia/Shanghai)
 */
function getTodayRange(tz: string = "Asia/Shanghai"): { start: Date; end: Date } {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayStr = formatter.format(now); // YYYY-MM-DD
  const start = new Date(`${todayStr}T00:00:00+08:00`);
  const end = new Date(`${todayStr}T23:59:59.999+08:00`);
  return { start, end };
}

export function taskCommands(program: Command) {
  const syncService = new SyncService();
  const batchService = new BatchService();

  const task = program.command("task").description("Manage tasks");

  task
    .command("today")
    .description("List today's tasks (due today or overdue)")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const data = await syncService.fullSync();
        const tasks = (data.tasks || []).filter(
          (t) => t.status !== 2 && t.status !== undefined
        );
        const projects = data.projects || [];
        const projectNames = new Map<string, string>();
        for (const p of projects) {
          projectNames.set(p.id, p.name);
        }

        const { start, end } = getTodayRange();
        const todayMs = start.getTime();
        const nowMs = Date.now();

        // Filter: due today OR overdue (dueDate < today && not completed)
        const todayTasks = tasks.filter((t) => {
          if (!t.dueDate) return false;
          const dueMs = new Date(t.dueDate).getTime();
          return dueMs <= nowMs; // due today or overdue
        });

        // Sort: overdue first, then by due date ascending, then by priority descending
        todayTasks.sort((a, b) => {
          const aDue = new Date(a.dueDate!).getTime();
          const bDue = new Date(b.dueDate!).getTime();
          const aOverdue = aDue < todayMs;
          const bOverdue = bDue < todayMs;
          if (aOverdue !== bOverdue) return aOverdue ? -1 : 1;
          if (aDue !== bDue) return aDue - bDue;
          return (b.priority || 0) - (a.priority || 0);
        });

        if (options.json) {
          console.log(
            formatJSON(
              todayTasks.map((t) => ({
                id: t.id,
                projectId: t.projectId,
                title: t.title,
                dueDate: t.dueDate,
                priority: t.priority,
                status: t.status,
                project: projectNames.get(t.projectId) || t.projectId,
              }))
            )
          );
          return;
        }

        const priorityIcons: Record<number, string> = {
          0: "",
          1: "🔴",
          3: "🟡",
          5: "🔴",
        };

        if (todayTasks.length === 0) {
          console.log("今天没有待办任务 🎉");
          return;
        }

        const todayStr = start.toISOString().split("T")[0];
        console.log(`📋 今日任务 (${todayStr}) — ${todayTasks.length} 个`);
        console.log("─".repeat(50));

        for (const t of todayTasks) {
          const dueMs = new Date(t.dueDate!).getTime();
          const isOverdue = dueMs < todayMs;
          const icon = priorityIcons[t.priority || 0] || "";
          const project = projectNames.get(t.projectId) || "";
          const dueStr = t.dueDate
            ? new Date(t.dueDate).toISOString().split("T")[0]
            : "";
          const overdueTag = isOverdue ? " ⚠️逾期" : "";
          console.log(
            `${icon} [ ] ${t.title} (截止: ${dueStr})${overdueTag} — ${project}`
          );
        }

        const overdueCount = todayTasks.filter(
          (t) => new Date(t.dueDate!).getTime() < todayMs
        ).length;
        if (overdueCount > 0) {
          console.log(`\n⚠️ 有 ${overdueCount} 个任务逾期，建议优先处理`);
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  task
    .command("create <title>")
    .description("Create a new task")
    .requiredOption("-p, --project <projectId>", "Project ID")
    .option("-c, --content <content>", "Task content/description")
    .option("-d, --due <date>", "Due date (ISO 8601 format)")
    .option(
      "--priority <priority>",
      "Priority (0=none, 1=low, 3=medium, 5=high)",
      "0"
    )
    .option("-j, --json", "Output as JSON")
    .action(async (title: string, options) => {
      try {
        const taskData: Record<string, unknown> = {
          title,
          projectId: options.project,
        };

        if (options.content) {
          taskData.content = options.content;
        }

        if (options.due) {
          taskData.dueDate = options.due;
        }

        if (options.priority) {
          const priority = parseInt(options.priority, 10);
          if (![0, 1, 3, 5].includes(priority)) {
            console.error("Error: Priority must be 0 (none), 1 (low), 3 (medium), or 5 (high).");
            process.exit(1);
          }
          taskData.priority = priority;
        }

        const result = await batchService.createTask(
          taskData as { title: string; projectId: string }
        );

        if (options.json) {
          console.log(formatJSON(result));
        } else {
          console.log("Task created successfully!");
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  task
    .command("show <taskId>")
    .description("Show task details")
    .option("-j, --json", "Output as JSON")
    .action(async (taskId: string, options) => {
      try {
        const taskData = await syncService.getTask(taskId);

        if (!taskData) {
          console.error(`Task ${taskId} not found.`);
          process.exit(1);
        }

        if (options.json) {
          console.log(formatJSON(taskData));
        } else {
          console.log(formatTask(taskData));
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  task
    .command("update <taskId>")
    .description("Update an existing task")
    .requiredOption("-p, --project <projectId>", "Project ID")
    .option("-t, --title <title>", "New title")
    .option("-c, --content <content>", "New content/description")
    .option("-d, --due <date>", "New due date (ISO 8601 format)")
    .option(
      "--priority <priority>",
      "Priority (0=none, 1=low, 3=medium, 5=high)"
    )
    .option("-j, --json", "Output as JSON")
    .action(async (taskId: string, options) => {
      try {
        const updates: Record<string, unknown> = {
          id: taskId,
          projectId: options.project,
        };

        if (options.title) updates.title = options.title;
        if (options.content) updates.content = options.content;
        if (options.due) updates.dueDate = options.due;

        if (options.priority) {
          const priority = parseInt(options.priority, 10);
          if (![0, 1, 3, 5].includes(priority)) {
            console.error("Error: Priority must be 0 (none), 1 (low), 3 (medium), or 5 (high).");
            process.exit(1);
          }
          updates.priority = priority;
        }

        const result = await batchService.updateTask(
          updates as { id: string; projectId: string }
        );

        if (options.json) {
          console.log(formatJSON(result));
        } else {
          console.log("Task updated successfully!");
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  task
    .command("complete <taskId> <projectId>")
    .description("Mark a task as complete")
    .action(async (taskId: string, projectId: string) => {
      try {
        await batchService.completeTask(taskId, projectId);
        console.log("Task marked as complete!");
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  task
    .command("delete <taskId> <projectId>")
    .description("Delete a task")
    .action(async (taskId: string, projectId: string) => {
      try {
        await batchService.deleteTask(taskId, projectId);
        console.log("Task deleted successfully!");
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
