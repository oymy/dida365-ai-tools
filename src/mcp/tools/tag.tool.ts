import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { TagService } from "../../core/services/tag.service.js";
import { errorResponse } from "../utils/response.js";

export function registerTagTools(server: McpServer) {
  const tagService = new TagService();

  server.registerTool(
    "dida365_list_tags",
    {
      description:
        "List all tags in your Dida365 account. ",
    },
    async () => {
      try {
        const tags = await tagService.listAll();
        return {
          content: [
            { type: "text" as const, text: JSON.stringify(tags, null, 2) },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_create_tag",
    {
      description:
        "Create a new tag. ",
      inputSchema: {
        name: z.string().describe("Tag name"),
        color: z.string().optional().describe("Tag color (e.g., '#ff0000')"),
        parent: z.string().optional().describe("Parent tag name for nesting"),
      },
    },
    async ({ name, color, parent }) => {
      try {
        await tagService.create({ name, color, parent });
        return {
          content: [
            { type: "text" as const, text: `Tag "${name}" created successfully.` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_rename_tag",
    {
      description:
        "Rename an existing tag. ",
      inputSchema: {
        oldName: z.string().describe("Current tag name"),
        newName: z.string().describe("New tag name"),
      },
    },
    async ({ oldName, newName }) => {
      try {
        await tagService.rename(oldName, newName);
        return {
          content: [
            {
              type: "text" as const,
              text: `Tag "${oldName}" renamed to "${newName}" successfully.`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_update_tag",
    {
      description:
        "Update tag properties (color, parent). ",
      inputSchema: {
        name: z.string().describe("Tag name to update"),
        color: z.string().optional().describe("New color (e.g., '#ff0000')"),
        parent: z
          .string()
          .optional()
          .describe("Parent tag name (empty string to remove parent)"),
      },
    },
    async ({ name, color, parent }) => {
      try {
        await tagService.update({ name, color, parent });
        return {
          content: [
            { type: "text" as const, text: `Tag "${name}" updated successfully.` },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_merge_tags",
    {
      description:
        "Merge one tag into another. Tasks with the source tag will be updated to the target tag. ",
      inputSchema: {
        fromTag: z.string().describe("Source tag name (will be deleted)"),
        toTag: z.string().describe("Target tag name (will remain)"),
      },
    },
    async ({ fromTag, toTag }) => {
      try {
        await tagService.merge(fromTag, toTag);
        return {
          content: [
            {
              type: "text" as const,
              text: `Tag "${fromTag}" merged into "${toTag}" successfully.`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    }
  );

  server.registerTool(
    "dida365_delete_tag",
    {
      description:
        "Delete one or more tags. ",
      inputSchema: {
        names: z
          .array(z.string())
          .describe("Array of tag names to delete"),
      },
    },
    async ({ names }) => {
      try {
        await tagService.deleteBatch(names);
        return {
          content: [
            {
              type: "text" as const,
              text: `Tag(s) "${names.join('", "')}" deleted successfully.`,
            },
          ],
        };
      } catch (error) {
        return errorResponse(error);
      }
    }
  );
}
