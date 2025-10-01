#!/usr/bin/env node

import { Command } from 'commander';
import { diffCommand } from './commands/diff';
import { configCommand } from './commands/config';
import { baselineCommand } from './commands/baseline';
import { reportCommand } from './commands/report';

const program = new Command();

program
  .name('browserdiff')
  .description('Cross-browser UI testing and visual regression tool')
  .version('1.0.0');

// Register commands
program.addCommand(diffCommand);
program.addCommand(configCommand);
program.addCommand(baselineCommand);
program.addCommand(reportCommand);

// Parse arguments
program.parse(process.argv);

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
