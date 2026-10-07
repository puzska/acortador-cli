#!/usr/bin/env node

import { runCli } from '../src/cli/index.js';

const args = process.argv.slice(2);
const exitCode = runCli(args);
process.exit(exitCode);
