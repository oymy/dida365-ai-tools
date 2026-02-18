#!/usr/bin/env node

import { createRequire } from "node:module";
import { Command } from "commander";
import { authCommands } from "./commands/auth.cmd.js";
import { taskCommands } from "./commands/task.cmd.js";
import { projectCommands } from "./commands/project.cmd.js";
import { completedCommands } from "./commands/completed.cmd.js";
import { syncCommands } from "./commands/sync.cmd.js";
import { tagCommands } from "./commands/tag.cmd.js";
import { batchCommands } from "./commands/batch.cmd.js";
import { quadrantCommands } from "./commands/quadrant.cmd.js";

const require = createRequire(import.meta.url);
const { version } = require("../../package.json");

const program = new Command();

program
  .name("dida365")
  .description("Dida365 (TickTick CN) CLI tool - Manage your tasks from the command line")
  .version(version);

authCommands(program);
projectCommands(program);
taskCommands(program);
completedCommands(program);
syncCommands(program);
tagCommands(program);
batchCommands(program);
quadrantCommands(program);

program.parse();
