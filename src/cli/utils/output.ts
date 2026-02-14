import type { Dida365Task, Dida365Project } from "../../core/types.js";

/**
 * Format a task for console output
 */
export function formatTask(task: Dida365Task): string {
  const lines = [
    `ID: ${task.id}`,
    `Title: ${task.title}`,
    `Project: ${task.projectId}`,
  ];

  if (task.content) {
    lines.push(`Content: ${task.content}`);
  }

  if (task.dueDate) {
    lines.push(`Due: ${task.dueDate}`);
  }

  if (task.priority) {
    lines.push(`Priority: ${task.priority}`);
  }

  if (task.tags && task.tags.length > 0) {
    lines.push(`Tags: ${task.tags.join(", ")}`);
  }

  if (task.completedTime) {
    lines.push(`Completed: ${task.completedTime}`);
  }

  return lines.join("\n");
}

/**
 * Format a list of tasks for console output
 */
export function formatTaskList(tasks: Dida365Task[]): string {
  if (tasks.length === 0) {
    return "No tasks found.";
  }

  const output = [`Found ${tasks.length} task(s):\n`];

  tasks.forEach((task, index) => {
    output.push(`\n[${index + 1}] ${task.title}`);
    output.push(`    ID: ${task.id}`);

    if (task.completedTime) {
      output.push(`    Completed: ${task.completedTime}`);
    }

    if (task.dueDate) {
      output.push(`    Due: ${task.dueDate}`);
    }

    if (task.tags && task.tags.length > 0) {
      output.push(`    Tags: ${task.tags.join(", ")}`);
    }
  });

  return output.join("\n");
}

/**
 * Format a project for console output
 */
export function formatProject(project: Dida365Project): string {
  const lines = [
    `ID: ${project.id}`,
    `Name: ${project.name}`,
  ];

  if (project.kind) {
    lines.push(`Kind: ${project.kind}`);
  }

  return lines.join("\n");
}

/**
 * Format a list of projects for console output
 */
export function formatProjectList(projects: Dida365Project[]): string {
  if (projects.length === 0) {
    return "No projects found.";
  }

  const output = [`Found ${projects.length} project(s):\n`];

  projects.forEach((project, index) => {
    output.push(`\n[${index + 1}] ${project.name}`);
    output.push(`    ID: ${project.id}`);

    if (project.kind) {
      output.push(`    Kind: ${project.kind}`);
    }
  });

  return output.join("\n");
}

/**
 * Format data as JSON
 */
export function formatJSON(data: unknown): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format error message
 */
export function formatError(error: unknown): string {
  if (error instanceof Error) {
    return `Error: ${error.message}`;
  }
  return `Error: ${String(error)}`;
}
