import {
  batchCheck,
  getUserSettings,
} from "../api-client.js";
import type {
  BatchCheckResponse,
  UserSettings,
  Dida365Task,
  Dida365Project,
  Dida365ProjectGroup,
  Dida365Tag,
} from "../types.js";

/**
 * Parsed result of a full sync operation
 */
export interface SyncResult {
  tasks: Dida365Task[];
  projects: Dida365Project[];
  projectGroups: Dida365ProjectGroup[];
  tags: Dida365Tag[];
  inboxId?: string;
}

/**
 * Service for syncing all data from Dida365
 * Uses private API: GET /batch/check/0
 */
export class SyncService {
  /**
   * Full sync - fetch all tasks, projects, tags, etc.
   */
  async fullSync(): Promise<SyncResult> {
    const raw: BatchCheckResponse = await batchCheck();

    return {
      tasks: raw.syncTaskBean?.update || [],
      projects: raw.projectProfiles || [],
      projectGroups: raw.projectGroups || [],
      tags: raw.tags || [],
      inboxId: raw.inboxId,
    };
  }

  /**
   * Get user settings (timezone, date format, etc.)
   */
  async getSettings(): Promise<UserSettings> {
    return getUserSettings();
  }

  /**
   * Get user's timezone from settings
   */
  async getTimezone(): Promise<string> {
    const settings = await this.getSettings();
    return settings.timeZone || "Asia/Shanghai";
  }
}
