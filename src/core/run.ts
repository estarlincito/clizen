import { error, log } from 'lumilog';

import type { Command } from './command.js';
import type { ParsedArgs } from './type.js';

/**
 * Executes a CLI command by parsing arguments, handling flags like --help and --version,
 * delegating to subcommands, or running the command's main action.
 */
export class RunCommand {
  /**
   * @param command The command instance to execute
   * @param argvs CLI arguments array (default: process.argv.slice(2))
   */
  constructor(
    private readonly command: Command,
    private readonly argvs: string[] = process.argv.slice(2),
  ) {}

  /**
   * Executes the command:
   * - Shows help if requested
   * - Shows version if requested
   * - Delegates to a subcommand if present
   * - Runs the command action if defined
   * - Shows error if unknown args or no action is defined
   */
  async execute(): Promise<void> {
    const parsed = this.command.parse(this.argvs);
    const help = this.command.help.bind(this.command);
    const { name, action, version, subcommands } = this.command.getDefinition();

    // Handle --help flags
    if (parsed.opts.has('h') || parsed.opts.has('help')) {
      help();
      return;
    }

    // Handle --version flags
    if (parsed.opts.has('v') || parsed.opts.has('version')) {
      log(version ?? 'Version not provided.');
      return;
    }

    // Handle subcommands
    if (parsed.remaining.length > 0) {
      const subName = parsed.remaining[0];
      const subcommand = subcommands.find(
        (cmd) =>
          cmd.getDefinition().name === subName ||
          cmd.getDefinition().aliases.includes(subName),
      );

      if (subcommand) {
        await subcommand.run(parsed.remaining.slice(1));
        return;
      }
    }

    // Run main action if defined
    if (action) {
      const parsedArgs: ParsedArgs = {
        args: parsed.args,
        options: Object.fromEntries(parsed.opts),
      };
      await action(parsedArgs, this.command);
    }
    // No action but has subcommands
    else if (subcommands.length > 0) {
      if (parsed.args.length === 0 && parsed.remaining.length === 0) {
        if (subcommands.length > 0) {
          log(`No command provided. Available commands for "${name}":`);
          this.command.help(true);
        } else {
          this.command.help();
        }
      } else {
        error(`Error: Unknown command or arguments: ${parsed.args.join(', ')}`);
        help();
      }
    }
    // No action, no subcommands
    else {
      error(`Error: No action defined for command "${name}"`);
      help();
    }
  }
}
