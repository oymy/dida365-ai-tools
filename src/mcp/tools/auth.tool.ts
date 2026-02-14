import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { buildAuthUrl, exchangeCodeForToken } from "../../core/auth.js";
import { saveToken, loadToken } from "../../core/token-store.js";
import type { Dida365Config } from "../../core/types.js";
import { randomUUID } from "crypto";

export function registerAuthTool(server: McpServer, config: Dida365Config) {
  server.registerTool(
    "dida365_auth",
    {
      description:
        "Authenticate with Dida365. " +
        "action='login': get the auth URL to open in browser. " +
        "action='callback': exchange the authorization code for a token. " +
        "action='status': check if already authenticated.",
      inputSchema: {
        action: z
          .enum(["login", "callback", "status"])
          .describe("login: generate auth URL; callback: exchange code for token; status: check auth state"),
        code: z
          .string()
          .optional()
          .describe("The authorization code from the redirect URL (required for action='callback')"),
      },
    },
    async ({ action, code }) => {
      if (action === "status") {
        const token = await loadToken();
        if (token) {
          return {
            content: [{ type: "text" as const, text: "Authenticated. Token is present and saved." }],
          };
        }
        return {
          content: [{ type: "text" as const, text: "Not authenticated. Use action='login' to start the OAuth flow." }],
        };
      }

      if (action === "login") {
        if (!config.clientId || !config.clientSecret) {
          return {
            content: [{
              type: "text" as const,
              text: "Error: DIDA365_CLIENT_ID and DIDA365_CLIENT_SECRET must be set in environment variables or .env file.",
            }],
            isError: true,
          };
        }
        const state = randomUUID();
        const url = buildAuthUrl(config, state);
        return {
          content: [{
            type: "text" as const,
            text: [
              "Please open this URL in your browser to authorize:",
              "",
              url,
              "",
              "After authorizing, you will be redirected. Copy the 'code' parameter from the redirect URL.",
              "Then call this tool again with action='callback' and the code.",
            ].join("\n"),
          }],
        };
      }

      if (action === "callback") {
        if (!code) {
          return {
            content: [{ type: "text" as const, text: "Error: 'code' parameter is required for action='callback'." }],
            isError: true,
          };
        }
        const tokenData = await exchangeCodeForToken(config, code);
        await saveToken(tokenData);
        return {
          content: [{ type: "text" as const, text: "Authentication successful! Token has been saved. You can now use other Dida365 tools." }],
        };
      }

      return {
        content: [{ type: "text" as const, text: "Unknown action. Use 'login', 'callback', or 'status'." }],
        isError: true,
      };
    }
  );
}
