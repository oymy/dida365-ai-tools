import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { homedir } from "os";
import type { TokenData } from "./types.js";

const TOKEN_DIR = join(homedir(), ".dida365");
const TOKEN_FILE = join(TOKEN_DIR, "token.json");

export async function saveToken(tokenData: TokenData): Promise<void> {
  await mkdir(TOKEN_DIR, { recursive: true });
  await writeFile(TOKEN_FILE, JSON.stringify(tokenData, null, 2), "utf-8");
}

export async function loadToken(): Promise<TokenData | null> {
  try {
    const raw = await readFile(TOKEN_FILE, "utf-8");
    const data = JSON.parse(raw) as TokenData;
    if (data.access_token) {
      return data;
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
