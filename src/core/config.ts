import { config as loadDotenv } from "dotenv";
import { resolve } from "path";
import type { Dida365Config } from "./types.js";

export function loadConfig(): Dida365Config {
  loadDotenv({ path: resolve(process.cwd(), ".env") });

  const clientId = process.env.DIDA365_CLIENT_ID;
  const clientSecret = process.env.DIDA365_CLIENT_SECRET;
  const redirectUri = process.env.DIDA365_REDIRECT_URI || "http://localhost:8080/callback";

  if (!clientId || !clientSecret) {
    console.error(
      "[dida365-ai-tools] Warning: DIDA365_CLIENT_ID and/or DIDA365_CLIENT_SECRET not set."
    );
  }

  return {
    clientId: clientId ?? "",
    clientSecret: clientSecret ?? "",
    redirectUri,
  };
}
