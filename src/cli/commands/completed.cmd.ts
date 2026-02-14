import { Command } from "commander";
import { CompletedTaskService } from "../../core/services/completed.service.js";
import { formatTaskList, formatJSON, formatError } from "../utils/output.js";

export function completedCommands(program: Command) {
  const completed = program
    .command("completed")
    .description("Query completed tasks (uses private API)");

  const service = new CompletedTaskService();

  completed
    .command("today")
    .description("Get tasks completed today")
    .option("-tz, --timezone <timezone>", "Timezone", "Asia/Shanghai")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const tasks = await service.getToday(options.timezone);

        if (options.json) {
          console.log(formatJSON(tasks));
        } else {
          console.log(`Tasks completed today (${new Date().toISOString().split("T")[0]}):\n`);
          console.log(formatTaskList(tasks));
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  completed
    .command("yesterday")
    .description("Get tasks completed yesterday")
    .option("-tz, --timezone <timezone>", "Timezone", "Asia/Shanghai")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const tasks = await service.getYesterday(options.timezone);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        if (options.json) {
          console.log(formatJSON(tasks));
        } else {
          console.log(
            `Tasks completed yesterday (${yesterday.toISOString().split("T")[0]}):\n`
          );
          console.log(formatTaskList(tasks));
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  completed
    .command("week")
    .description("Get tasks completed this week")
    .option("-tz, --timezone <timezone>", "Timezone", "Asia/Shanghai")
    .option("-j, --json", "Output as JSON")
    .action(async (options) => {
      try {
        const tasks = await service.getThisWeek(options.timezone);

        if (options.json) {
          console.log(formatJSON(tasks));
        } else {
          console.log("Tasks completed this week:\n");
          console.log(formatTaskList(tasks));
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  completed
    .command("date <date>")
    .description("Get tasks completed on a specific date")
    .option("-tz, --timezone <timezone>", "Timezone", "Asia/Shanghai")
    .option("-j, --json", "Output as JSON")
    .action(async (date: string, options) => {
      try {
        const tasks = await service.getByDate(new Date(date), options.timezone);

        if (options.json) {
          console.log(formatJSON(tasks));
        } else {
          console.log(`Tasks completed on ${date}:\n`);
          console.log(formatTaskList(tasks));
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });

  completed
    .command("range <startDate> <endDate>")
    .description("Get tasks completed in a date range")
    .option("-tz, --timezone <timezone>", "Timezone", "Asia/Shanghai")
    .option("-j, --json", "Output as JSON")
    .action(async (startDate: string, endDate: string, options) => {
      try {
        const tasks = await service.getByDateRange(
          new Date(startDate),
          new Date(endDate),
          options.timezone
        );

        if (options.json) {
          console.log(formatJSON(tasks));
        } else {
          console.log(`Tasks completed between ${startDate} and ${endDate}:\n`);
          console.log(formatTaskList(tasks));
        }
      } catch (error) {
        console.error(formatError(error));
        process.exit(1);
      }
    });
}
