import { Command } from "commander";
import { SyncService } from "../../core/services/sync.service.js";
import { formatJSON, formatError } from "../utils/output.js";

export function syncCommands(program: Command) {
  const sync = program
    .command("sync")
    .description("Sync and query account data (uses private API)");

  const service = new SyncService();

  sync
    .command("all")
    .description("Full sync - fetch all tasks, projects, tags")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const result = await service.fullSync();

        if (options.json) {
          console.log(formatJSON(result));
        } else {
          console.log("Sync complete!\n");
          console.log(`  Inbox ID: ${result.inboxId || "N/A"}`);
          console.log(`  Projects: ${result.projects.length}`);
          console.log(`  Folders:  ${result.projectGroups.length}`);
          console.log(`  Tags:     ${result.tags.length}`);
          console.log(`  Tasks:    ${result.tasks.length}`);

          if (result.projects.length > 0) {
            console.log("\nProjects:");
            result.projects.forEach((p) => {
              console.log(`  - ${p.name} (${p.id})`);
            });
          }

          if (result.tags.length > 0) {
            console.log("\nTags:");
            result.tags.forEach((t) => {
              const extra = t.color ? ` [${t.color}]` : "";
              const parent = t.parent ? ` (under: ${t.parent})` : "";
              console.log(`  - ${t.name}${extra}${parent}`);
            });
          }
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  sync
    .command("settings")
    .description("Get user settings (timezone, date format, etc.)")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const settings = await service.getSettings();

        if (options.json) {
          console.log(formatJSON(settings));
        } else {
          console.log("User Settings:\n");
          Object.entries(settings).forEach(([key, value]) => {
            console.log(`  ${key}: ${JSON.stringify(value)}`);
          });
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  sync
    .command("timezone")
    .description("Get user's timezone")
    .action(async () => {
      try {
        const tz = await service.getTimezone();
        console.log(tz);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
