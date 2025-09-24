#!/usr/bin/env node

import { error, log } from 'lumilog';

import { cli } from './core/cli.js';
import { command } from './core/command.js';
import { flag } from './core/flag.js';
import { version } from './utils/pkg.js';

const printHelp = () => {
  log(`
Usage: clizen <command> [options]

Commands:
  demo                     Run demo command to show context
  --help, -h              Show this help message
  --version, -v           Show version

Examples:
  clizen --version
  clizen --help
  clizen demo
  clizen demo --version
`);
};

// Demo command that shows the context
const demoCommand = command(['demo'], (ctx) => {
  log('📦 Demo Command Executed!');
  log('Context:', JSON.stringify(ctx, null, 2));

  if (ctx.flags?.version) {
    log(`✨ Version from flag: ${version}`);
  }
});

// Version flag
const versionFlag = flag(
  ['--version', '-v'],
  () => {
    log(`🚀 clizen v${version}`);
  },
  { isBoolean: true },
);

// Help flag
const helpFlag = flag(
  ['--help', '-h'],
  () => {
    printHelp();
  },
  { isBoolean: true },
);

// Demo flag with value
const nameFlag = flag(
  ['--name', '-n'],
  (ctx) => {
    log(`👋 Hello, ${ctx.input ?? 'stranger'}!`);
  },
  {
    choices: ['Alice', 'Bob', 'Charlie'],
    defaultValue: 'Guest',
  },
);

// Create CLI with all commands and flags
const run = cli(demoCommand, helpFlag, versionFlag, nameFlag);

// Run with process.argv
const main = async () => {
  const args = process.argv.slice(2);
  const context = await run(args);

  const hasCommands = (context.commands ?? []).length > 0;
  const hasFlags = context.flags && Object.keys(context.flags).length > 0;

  if (!args.length) {
    error(
      'No arguments provided. Use --help to see available commands and flags.',
    );
    process.exit(1);
  } else if (!hasCommands && !hasFlags) {
    error('No valid commands or flags provided. Use --help for usage.');
    process.exit(1);
  }
};

await main();
