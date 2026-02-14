import { Command } from "commander";
import { SyncService } from "../../core/services/sync.service.js";
import { BatchService } from "../../core/services/batch.service.js";
import { formatTask, formatJSON, formatError } from "../utils/output.js";

export function taskCommands(program: Command) {
  const syncService = new SyncService();
  const batchService = new BatchService();

  const task = program.command("task").description("Manage tasks");

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
          taskData.priority = parseInt(options.priority, 10);
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
