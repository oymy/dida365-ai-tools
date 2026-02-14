import { Command } from "commander";
import { TagService } from "../../core/services/tag.service.js";
import { formatJSON, formatError } from "../utils/output.js";

export function tagCommands(program: Command) {
  const tag = program
    .command("tag")
    .description("Manage tags (uses private API)");

  const service = new TagService();

  tag
    .command("list")
    .description("List all tags")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const tags = await service.listAll();

        if (options.json) {
          console.log(formatJSON(tags));
        } else {
          if (tags.length === 0) {
            console.log("No tags found.");
            return;
          }
          console.log(`Found ${tags.length} tag(s):\n`);
          tags.forEach((t, i) => {
            const color = t.color ? ` [${t.color}]` : "";
            const parent = t.parent ? ` (under: ${t.parent})` : "";
            console.log(`  [${i + 1}] ${t.name}${color}${parent}`);
          });
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  tag
    .command("create <name>")
    .description("Create a new tag")
    .option("-c, --color <color>", "Tag color (e.g., '#ff0000')")
    .option("-p, --parent <parent>", "Parent tag name")
    .action(async (name: string, options) => {
      try {
        await service.create({
          name,
          color: options.color,
          parent: options.parent,
        });
        console.log(`Tag "${name}" created successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  tag
    .command("rename <oldName> <newName>")
    .description("Rename a tag")
    .action(async (oldName: string, newName: string) => {
      try {
        await service.rename(oldName, newName);
        console.log(`Tag "${oldName}" renamed to "${newName}" successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  tag
    .command("color <name> <color>")
    .description("Set tag color")
    .action(async (name: string, color: string) => {
      try {
        await service.setColor(name, color);
        console.log(`Tag "${name}" color set to ${color}.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  tag
    .command("nest <name> <parent>")
    .description("Set tag parent (nesting)")
    .action(async (name: string, parent: string) => {
      try {
        await service.setParent(name, parent);
        console.log(`Tag "${name}" is now under "${parent}".`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  tag
    .command("merge <fromTag> <toTag>")
    .description("Merge one tag into another")
    .action(async (fromTag: string, toTag: string) => {
      try {
        await service.merge(fromTag, toTag);
        console.log(`Tag "${fromTag}" merged into "${toTag}" successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  tag
    .command("delete <names...>")
    .description("Delete one or more tags")
    .action(async (names: string[]) => {
      try {
        await service.deleteBatch(names);
        console.log(`Tag(s) "${names.join('", "')}" deleted successfully.`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
