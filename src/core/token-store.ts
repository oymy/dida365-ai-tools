import { readFile, writeFile, mkdir, chmod } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import type { TokenData } from "./types.js";

const TOKEN_DIR = join(homedir(), ".dida365");
const TOKEN_FILE = join(TOKEN_DIR, "token.json");

export async function saveToken(token: string): Promise<void> {
  const tokenData: TokenData = { token, saved_at: Date.now() };
  await mkdir(TOKEN_DIR, { recursive: true, mode: 0o700 });
  await writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), "utf-8");
  await chmod(TOKEN_FILE, 0o600);
}

export async function loadToken(): Promise<TokenData | null> {
  try {
    const raw = await readFile(TOKEN_FILE, "utf-8");
    const data = JSON.parse(raw);
    // Support new format
    if (data.token) {
      return data as TokenData;
    }
    // Backward compat: migrate from old signon_token format
    if (data.signon_token) {
      return { token: data.signon_token, saved_at: data.signon_saved_at ?? data.saved_at ?? Date.now() };
    }
    return null;
  } catch {
    return null;
  }
}

export async function clearToken(): Promise<void> {
  try {
    await writeFile(TOKEN_FILE, "{}", "utf-8");
  } catch {
    // ignore
  }
}
