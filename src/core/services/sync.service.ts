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

  /**
   * List all projects
   */
  async listProjects(): Promise<Dida365Project[]> {
    const result = await this.fullSync();
    return result.projects;
  }

  /**
   * Get a project with its tasks
   */
  async getProjectWithTasks(
    projectId: string
  ): Promise<{ project: Dida365Project | undefined; tasks: Dida365Task[] }> {
    const result = await this.fullSync();
    const project = result.projects.find((p) => p.id === projectId);
    const tasks = result.tasks.filter((t) => t.projectId === projectId);
    return { project, tasks };
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<Dida365Task | undefined> {
    const result = await this.fullSync();
    return result.tasks.find((t) => t.id === taskId);
  }
}
