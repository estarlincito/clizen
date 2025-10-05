import { Command } from './command.js';

/**
 * Main CLI instance.
 *
 * Represents the entry point of your CLI app.
 *
 * @example
 * ```ts
 * import { cli } from './cli.js';
 *
 * cli
 *   .name('my-cli')
 *   .version('1.0.0')
 *   .description('A simple CLI tool')
 *   .action(() => {
 *     console.log('Hello world!');
 *   });
 *
 * cli.run();
 * ```
 */
export const cli = new Command();
