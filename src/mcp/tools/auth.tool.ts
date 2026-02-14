import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { saveToken, loadToken } from "../../core/token-store.js";

export function registerAuthTool(server: McpServer) {
  server.registerTool(
    "dida365_auth",
    {
      description:
        "Authenticate with Dida365. " +
        "action='cookie': set cookie token from browser DevTools. " +
        "action='status': check if already authenticated.",
      inputSchema: {
        action: z
          .enum(["cookie", "status"])
          .describe("cookie: set cookie token; status: check auth state"),
        token: z
          .string()
          .optional()
          .describe(
            "The cookie token value (the 't' cookie from dida365.com, required for action='cookie')"
          ),
      },
    },
    async ({ action, token }) => {
      if (action === "status") {
        const tokenData = await loadToken();
        if (tokenData) {
          return {
            content: [
              {
                type: "text" as const,
                text: `Authenticated. Token saved at ${new Date(tokenData.saved_at).toLocaleString()}.`,
              },
            ],
          };
        }
        return {
          content: [
            {
              type: "text" as const,
              text: "Not authenticated. Use action='cookie' to set your cookie token from browser DevTools.",
            },
          ],
        };
      }

      if (action === "cookie") {
        if (!token) {
          return {
            content: [
              {
                type: "text" as const,
                text: "Error: 'token' parameter is required for action='cookie'.",
              },
            ],
            isError: true,
          };
        }
        await saveToken(token);
        return {
          content: [
            {
              type: "text" as const,
              text: "Cookie token saved! You can now use all Dida365 tools.",
            },
          ],
        };
      }

      return {
        content: [
          {
            type: "text" as const,
            text: "Unknown action. Use 'cookie' or 'status'.",
          },
        ],
        isError: true,
      };
    }
  );
}
