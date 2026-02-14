import { Command } from "commander";
import { loadConfig } from "../../core/config.js";
import { buildAuthUrl, exchangeCodeForToken } from "../../core/auth.js";
import { saveToken, loadToken } from "../../core/token-store.js";
import { randomUUID } from "crypto";
import { formatError } from "../utils/output.js";

export function authCommands(program: Command) {
  const auth = program
    .command("auth")
    .description("Manage authentication with Dida365");

  auth
    .command("login")
    .description("Start OAuth login flow")
    .action(async () => {
      try {
        const config = loadConfig();

        if (!config.clientId || !config.clientSecret) {
          console.error(
            "Error: DIDA365_CLIENT_ID and DIDA365_CLIENT_SECRET must be set in environment variables or .env file."
          );
          process.exit(1);
        }

        const state = randomUUID();
        const url = buildAuthUrl(config, state);

        console.log("Please open this URL in your browser to authorize:\n");
        console.log(url);
        console.log(
          "\nAfter authorizing, you will be redirected. Copy the 'code' parameter from the redirect URL."
        );
        console.log("Then run: dida365 auth callback <code>");
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  auth
    .command("callback <code>")
    .description("Complete OAuth flow with authorization code")
    .action(async (code: string) => {
      try {
        const config = loadConfig();
        const tokenData = await exchangeCodeForToken(config, code);
        await saveToken(tokenData);

        console.log("Authentication successful! Token has been saved.");
        console.log("You can now use other Dida365 commands.");
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  auth
    .command("status")
    .description("Check authentication status")
    .action(async () => {
      try {
        const token = await loadToken();

        if (token) {
          console.log("✓ Authenticated");
          console.log(`Token type: ${token.token_type}`);
          console.log(`Scope: ${token.scope}`);
        } else {
          console.log("✗ Not authenticated");
          console.log("Run 'dida365 auth login' to start the OAuth flow.");
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
