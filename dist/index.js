#!/usr/bin/env node
import { startTui } from "./tui/index.js";
import { runCli } from "./cli/index.js";
if (process.argv.includes('--ui'))
    startTui();
else
    runCli(process.argv);
