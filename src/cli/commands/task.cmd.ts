import { Command } from "commander";
import {
  getTask,
  createTask,
  updateTask,
  completeTask,
  deleteTask,
} from "../../core/api-client.js";
import { formatTask, formatJSON, formatError } from "../utils/output.js";

export function taskCommands(program: Command) {
  const task = program.command("task").description("Manage tasks");

  task
    .command("create <title>")
    .description("Create a new task")
    .requiredOption("-p, --project <projectId>", "Project ID")
    .option("-c, --content <content>", "Task content/description")
    .option("-d, --due <date>", "Due date (ISO 8601 format)")
    .option("--priority <priority>", "Priority (0=none, 1=low, 3=medium, 5=high)", "0")
    .option("-j, --json", "Output as JSON")
    .action(async (title: string, options) => {
      try {
        const taskData: any = {
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

        const newTask = await createTask(taskData);

        if (options.json) {
          console.log(formatJSON(newTask));
        } else {
          console.log("Task created successfully!\n");
          console.log(formatTask(newTask));
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  task
    .command("show <projectId> <taskId>")
    .description("Show task details")
    .option("-j, --json", "Output as JSON")
    .action(async (projectId: string, taskId: string, options) => {
      try {
        const taskData = await getTask(projectId, taskId);

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
    .command("complete <projectId> <taskId>")
    .description("Mark a task as complete")
    .action(async (projectId: string, taskId: string) => {
      try {
        await completeTask(projectId, taskId);
        console.log("Task marked as complete!");
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  task
    .command("delete <projectId> <taskId>")
    .description("Delete a task")
    .action(async (projectId: string, taskId: string) => {
      try {
        await deleteTask(projectId, taskId);
        console.log("Task deleted successfully!");
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
