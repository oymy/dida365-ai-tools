import { Command } from "commander";
import { SyncService } from "../../core/services/sync.service.js";
import { formatProjectList, formatJSON, formatError } from "../utils/output.js";

export function projectCommands(program: Command) {
  const syncService = new SyncService();

  const project = program
    .command("project")
    .description("Manage projects");

  project
    .command("list")
    .description("List all projects")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const projects = await syncService.listProjects();

        if (options.json) {
          console.log(formatJSON(projects));
        } else {
          console.log(formatProjectList(projects));
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  project
    .command("show <projectId>")
    .description("Show project details and tasks")
    .option("-j, --json", "Output as JSON")
    .action(async (projectId: string, options) => {
      try {
        const data = await syncService.getProjectWithTasks(projectId);

        if (options.json) {
          console.log(formatJSON(data));
        } else {
          console.log(`Project: ${data.project?.name || projectId}`);
          console.log(`\nTasks: ${data.tasks?.length || 0}`);

          if (data.tasks && data.tasks.length > 0) {
            data.tasks.forEach((task, index) => {
              console.log(`\n[${index + 1}] ${task.title}`);
              console.log(`    ID: ${task.id}`);
              if (task.dueDate) {
                console.log(`    Due: ${task.dueDate}`);
              }
            });
          }
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
