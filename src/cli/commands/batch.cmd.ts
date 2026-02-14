import { Command } from "commander";
import { BatchService } from "../../core/services/batch.service.js";
import { formatJSON, formatError } from "../utils/output.js";

export function batchCommands(program: Command) {
  const batch = program
    .command("batch")
    .description("Batch operations on tasks, projects, folders (uses private API)");

  const service = new BatchService();

  // ---- Task operations ----

  batch
    .command("move-task <taskId> <fromProjectId> <toProjectId>")
    .description("Move a task to a different project")
    .action(async (taskId: string, fromProjectId: string, toProjectId: string) => {
      try {
        await service.moveTask(taskId, fromProjectId, toProjectId);
        console.log("Task moved successfully.");
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  batch
    .command("set-subtask <taskId> <parentId> <projectId>")
    .description("Set a task as subtask of another task")
    .action(async (taskId: string, parentId: string, projectId: string) => {
      try {
        await service.setSubtask(taskId, parentId, projectId);
        console.log(`Task ${taskId} is now a subtask of ${parentId}.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  batch
    .command("delete-tasks")
    .description("Delete multiple tasks (reads JSON from stdin or args)")
    .argument("<items...>", "Pairs of taskId:projectId (e.g., task1:proj1 task2:proj2)")
    .action(async (items: string[]) => {
      try {
        const parsed = items.map((item) => {
          const [taskId, projectId] = item.split(":");
          if (!taskId || !projectId) {
            throw new Error(`Invalid format "${item}". Expected "taskId:projectId".`);
          }
          return { taskId, projectId };
        });

        await service.deleteTasks(parsed);
        console.log(`${parsed.length} task(s) deleted successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  // ---- Project operations ----

  batch
    .command("create-project <name>")
    .description("Create a project via batch API")
    .option("-c, --color <color>", "Project color")
    .option("-g, --group <groupId>", "Project group/folder ID")
    .option("-v, --view <viewMode>", "View mode (list, kanban)")
    .action(async (name: string, options) => {
      try {
        await service.createProject({
          id: "",
          name,
          color: options.color,
          groupId: options.group,
          viewMode: options.view,
        });
        console.log(`Project "${name}" created successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  batch
    .command("delete-projects <projectIds...>")
    .description("Delete multiple projects")
    .action(async (projectIds: string[]) => {
      try {
        await service.deleteProjects(projectIds);
        console.log(`${projectIds.length} project(s) deleted successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  // ---- Project Group/Folder operations ----

  batch
    .command("create-folder <name>")
    .description("Create a project folder/group")
    .action(async (name: string) => {
      try {
        await service.createProjectGroup({ name });
        console.log(`Project folder "${name}" created successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  batch
    .command("delete-folders <groupIds...>")
    .description("Delete project folders/groups")
    .action(async (groupIds: string[]) => {
      try {
        await service.deleteProjectGroups(groupIds);
        console.log(`${groupIds.length} folder(s) deleted successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
