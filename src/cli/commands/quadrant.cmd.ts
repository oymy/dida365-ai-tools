import { Command } from "commander";
import { SyncService } from "../../core/services/sync.service.js";
import { formatJSON, formatError } from "../utils/output.js";

interface Task {
  id: string;
  projectId: string;
  title: string;
  dueDate?: string;
  priority?: number;
  status?: number;
}

/**
 * Get quadrant based on priority and dueDate
 * Q1: priority=5 (important & urgent)
 * Q2: priority=3 + dueDate (important, not urgent)
 * Q3: priority=1 + dueDate (not important, urgent)
 * Q4: priority=0 or (priority=3/1 without dueDate) (not important, not urgent)
 */
function getQuadrant(task: Task): string {
  const priority = task.priority || 0;
  if (priority === 5) return "Q1";
  if (priority === 3 && task.dueDate) return "Q2";
  if (priority === 1 && task.dueDate) return "Q3";
  return "Q4";
}

function formatQuadrantTask(task: Task, projectName: string = ""): string {
  const quadrant = getQuadrant(task);
  const due = task.dueDate ? ` | Due: ${task.dueDate.split("T")[0]}` : "";
  const priorityLabels = ["", "🔴", "🟡", "", "🟢"];
  const priorityLabel = priorityLabels[task.priority || 0] || "";
  return `[${quadrant}] ${priorityLabel} ${task.title}${due} (${projectName})`;
}

function groupByQuadrant(tasks: Task[], projectNames: Map<string, string>): Map<string, Task[]> {
  const quadrants = new Map<string, Task[]>();
  quadrants.set("Q1", []);
  quadrants.set("Q2", []);
  quadrants.set("Q3", []);
  quadrants.set("Q4", []);

  for (const task of tasks) {
    if (task.status === 2) continue; // skip completed tasks (status === 2 means completed)
    if (task.status === undefined) continue; // skip tasks without status
    const quadrant = getQuadrant(task);
    quadrants.get(quadrant)!.push(task);
  }

  return quadrants;
}

export function quadrantCommands(program: Command) {
  const syncService = new SyncService();

  const quadrant = program
    .command("quadrant")
    .description("View tasks by Eisenhower matrix (四象限)");

  quadrant
    .command("list")
    .description("List all tasks grouped by quadrant")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const data = await syncService.fullSync();
        const tasks = data.tasks || [];
        const projects = data.projects || [];
        
        // Build project name map
        const projectNames = new Map<string, string>();
        for (const p of projects) {
          projectNames.set(p.id, p.name);
        }

        if (options.json) {
          const quadrants = groupByQuadrant(tasks, projectNames);
          const result: Record<string, Task[]> = {};
          for (const [q, t] of quadrants) {
            result[q] = t.map(t => ({
              id: t.id,
              projectId: t.projectId,
              title: t.title,
              dueDate: t.dueDate,
              priority: t.priority,
              status: t.status
            }));
          }
          console.log(formatJSON(result));
          return;
        }

        const quadrants = groupByQuadrant(tasks, projectNames);
        
        const quadrantNames: Record<string, string> = {
          "Q1": "📕 重要紧急 (Do First)",
          "Q2": "📒 重要不紧急 (Schedule)",
          "Q3": "📗 不重要紧急 (Delegate)",
          "Q4": "📙 不重要不紧急 (Eliminate)"
        };

        let total = 0;
        for (const [q, tasks] of quadrants) {
          console.log(`\n${quadrantNames[q]} — ${tasks.length} tasks`);
          console.log("─".repeat(50));
          for (const task of tasks) {
            const projectName = projectNames.get(task.projectId) || task.projectId;
            console.log(formatQuadrantTask(task, projectName));
          }
          total += tasks.length;
        }
        
        console.log(`\n${"─".repeat(50)}`);
        console.log(`Total: ${total} tasks`);
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  quadrant
    .command("view <quadrant>")
    .description("View tasks in a specific quadrant (Q1, Q2, Q3, Q4)")
    .option("-j, --json", "Output as JSON")
    .action(async (quadrant: string, options) => {
      try {
        const validQuadrants = ["Q1", "Q2", "Q3", "Q4"];
        if (!validQuadrants.includes(quadrant.toUpperCase())) {
          console.error(`Error: Invalid quadrant. Must be Q1, Q2, Q3, or Q4.`);
          process.exit(1);
        }

        const data = await syncService.fullSync();
        const tasks = data.tasks || [];
        const projects = data.projects || [];
        
        const projectNames = new Map<string, string>();
        for (const p of projects) {
          projectNames.set(p.id, p.name);
        }

        const quadrants = groupByQuadrant(tasks, projectNames);
        const targetTasks = quadrants.get(quadrant.toUpperCase()) || [];

        if (options.json) {
          console.log(formatJSON(targetTasks));
          return;
        }

        const quadrantNames: Record<string, string> = {
          "Q1": "📕 重要紧急 (Do First)",
          "Q2": "📒 重要不紧急 (Schedule)",
          "Q3": "📗 不重要紧急 (Delegate)",
          "Q4": "📙 不重要不紧急 (Eliminate)"
        };

        console.log(`\n${quadrantNames[quadrant.toUpperCase()]} — ${targetTasks.length} tasks`);
        console.log("─".repeat(50));
        
        if (targetTasks.length === 0) {
          console.log("(No tasks)");
        } else {
          for (const task of targetTasks) {
            const projectName = projectNames.get(task.projectId) || task.projectId;
            console.log(formatQuadrantTask(task, projectName));
          }
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
