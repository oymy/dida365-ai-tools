import type { Dida365Config, TokenData } from "./types.js";

const AUTHORIZE_URL = "https://dida365.com/oauth/authorize";
const TOKEN_URL = "https://dida365.com/oauth/token";

export function buildAuthUrl(config: Dida365Config, state: string): string {
  const params = new URLSearchParams({
    client_id: config.clientId,
    scope: "tasks:write tasks:read",
    state,
    redirect_uri: config.redirectUri,
    response_type: "code",
  });
  return `${AUTHORIZE_URL}?${params.toString()}`;
}

export async function exchangeCodeForToken(
  config: Dida365Config,
  code: string
): Promise<TokenData> {
  const basicAuth = Buffer.from(
    `${config.clientId}:${config.clientSecret}`
  ).toString("base64");

  const body = new URLSearchParams({
    code,
    grant_type: "authorization_code",
    scope: "tasks:write tasks:read",
    redirect_uri: config.redirectUri,
  });

  const response = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(
      `Token exchange failed (${response.status}): ${errorBody}`
    );
  }

  const data = (await response.json()) as { access_token: string };
  return {
    access_token: data.access_token,
    saved_at: Date.now(),
  };
}
