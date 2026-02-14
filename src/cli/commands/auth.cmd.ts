import { Command } from "commander";
import { saveToken, loadToken } from "../../core/token-store.js";
import { formatError } from "../utils/output.js";

export function authCommands(program: Command) {
  const auth = program
    .command("auth")
    .description("Manage authentication with Dida365");

  auth
    .command("cookie <token>")
    .description(
      "Set cookie token for API access (copy 't' cookie from browser DevTools)"
    )
    .action(async (token: string) => {
      try {
        await saveToken(token);
        console.log("Cookie token saved! You can now use all Dida365 commands.");
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
          console.log("Status: Authenticated");
          console.log(
            `Saved at: ${new Date(token.saved_at).toLocaleString()}`
          );
        } else {
          console.log("Status: Not authenticated");
          console.log(
            "Run 'dida365 auth cookie <token>' to set your cookie from browser."
          );
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
