import {
  batchTaskOperation,
  batchSetTaskParent,
  batchMoveTask,
  batchProjectOperation,
  batchProjectGroupOperation,
} from "../api-client.js";
import type {
  Dida365Task,
  Dida365Project,
  Dida365ProjectGroup,
  TaskMovePayload,
  TaskParentPayload,
} from "../types.js";

/**
 * Service for batch operations on tasks, projects, and project groups
 * Uses private API endpoints
 */
export class BatchService {
  // ---- Single Task Operations ----

  async createTask(
    task: Partial<Dida365Task> & { title: string; projectId: string }
  ): Promise<unknown> {
    return batchTaskOperation({ add: [task as Dida365Task] });
  }

  async updateTask(
    task: Partial<Dida365Task> & { id: string; projectId: string }
  ): Promise<unknown> {
    return batchTaskOperation({ update: [task as Dida365Task] });
  }

  async completeTask(taskId: string, projectId: string): Promise<unknown> {
    return batchTaskOperation({
      update: [{ id: taskId, projectId, status: 2 } as Dida365Task],
    });
  }

  async deleteTask(taskId: string, projectId: string): Promise<unknown> {
    return batchTaskOperation({ delete: [{ taskId, projectId }] });
  }

  // ---- Task Batch Operations ----

  /**
   * Batch delete tasks
   */
  async deleteTasks(
    items: Array<{ taskId: string; projectId: string }>
  ): Promise<unknown> {
    return batchTaskOperation({ delete: items });
  }

  /**
   * Set a task as subtask of another task
   * @param taskId - The task to become a subtask
   * @param parentId - The parent task
   * @param projectId - The project containing both tasks
   */
  async setSubtask(
    taskId: string,
    parentId: string,
    projectId: string
  ): Promise<unknown> {
    return batchSetTaskParent([{ taskId, parentId, projectId }]);
  }

  /**
   * Set multiple tasks as subtasks
   */
  async setSubtaskBatch(items: TaskParentPayload[]): Promise<unknown> {
    return batchSetTaskParent(items);
  }

  /**
   * Move a task to a different project
   */
  async moveTask(
    taskId: string,
    fromProjectId: string,
    toProjectId: string
  ): Promise<unknown> {
    return batchMoveTask([{ taskId, fromProjectId, toProjectId }]);
  }

  /**
   * Move multiple tasks between projects
   */
  async moveTaskBatch(items: TaskMovePayload[]): Promise<unknown> {
    return batchMoveTask(items);
  }

  /**
   * Move all tasks from one project to another
   * @param tasks - Array of task IDs to move
   * @param fromProjectId - Source project
   * @param toProjectId - Target project
   */
  async moveAllTasks(
    taskIds: string[],
    fromProjectId: string,
    toProjectId: string
  ): Promise<unknown> {
    const items: TaskMovePayload[] = taskIds.map((taskId) => ({
      taskId,
      fromProjectId,
      toProjectId,
    }));
    return batchMoveTask(items);
  }

  // ---- Project Batch Operations ----

  /**
   * Create a project via batch API
   */
  async createProject(project: Dida365Project): Promise<unknown> {
    return batchProjectOperation({ add: [project] });
  }

  /**
   * Create multiple projects
   */
  async createProjectBatch(projects: Dida365Project[]): Promise<unknown> {
    return batchProjectOperation({ add: projects });
  }

  /**
   * Update a project via batch API
   */
  async updateProject(project: Dida365Project): Promise<unknown> {
    return batchProjectOperation({ update: [project] });
  }

  /**
   * Update multiple projects
   */
  async updateProjectBatch(projects: Dida365Project[]): Promise<unknown> {
    return batchProjectOperation({ update: projects });
  }

  /**
   * Delete projects via batch API
   */
  async deleteProjects(projectIds: string[]): Promise<unknown> {
    return batchProjectOperation({ delete: projectIds });
  }

  // ---- Project Group/Folder Batch Operations ----

  /**
   * Create a project group/folder
   */
  async createProjectGroup(group: Dida365ProjectGroup): Promise<unknown> {
    return batchProjectGroupOperation({ add: [group] });
  }

  /**
   * Create multiple project groups
   */
  async createProjectGroupBatch(
    groups: Dida365ProjectGroup[]
  ): Promise<unknown> {
    return batchProjectGroupOperation({ add: groups });
  }

  /**
   * Update a project group
   */
  async updateProjectGroup(group: Dida365ProjectGroup): Promise<unknown> {
    return batchProjectGroupOperation({ update: [group] });
  }

  /**
   * Update multiple project groups
   */
  async updateProjectGroupBatch(
    groups: Dida365ProjectGroup[]
  ): Promise<unknown> {
    return batchProjectGroupOperation({ update: groups });
  }

  /**
   * Delete project groups
   */
  async deleteProjectGroups(groupIds: string[]): Promise<unknown> {
    return batchProjectGroupOperation({ delete: groupIds });
  }
}
