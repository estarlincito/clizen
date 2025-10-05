/* eslint-disable security/detect-object-injection */
import type { Command } from './command.js';
import type { Parsed } from './type.js';

/**
 * Parses CLI arguments for a given command,
 * separating positional args, options, and remaining unparsed items (like subcommands).
 */
export class ParseCommand {
  /**
   * @param command The command to parse arguments for
   * @param argvs Array of CLI arguments (default: process.argv.slice(2))
   */
  constructor(
    private readonly command: Command,
    private readonly argvs: string[] = process.argv.slice(2),
  ) {}

  /**
   * Executes the parsing logic.
   * @returns Parsed object with args, opts, and remaining arguments
   */
  execute(): Parsed {
    const parsed: Parsed = {
      args: [],
      opts: new Map(),
      remaining: [],
    };

    const { subcommands } = this.command.getDefinition();

    for (let i = 0; i < this.argvs.length; i += 1) {
      const arg = this.argvs[i];

      if (arg === '--') {
        parsed.remaining = this.argvs.slice(i + 1);
        break;
      }

      if (arg.startsWith('-')) {
        const equalsIndex = arg.indexOf('=');

        if (equalsIndex > -1) {
          const flag = arg.substring(0, equalsIndex).replace(/^-+/, '');
          const value = arg.substring(equalsIndex + 1);
          parsed.opts.set(flag, value);
        } else {
          const flag = arg.replace(/^-+/, '');
          const nextArg = i + 1 < this.argvs.length ? this.argvs[i + 1] : null;

          if (nextArg && !nextArg.startsWith('-')) {
            parsed.opts.set(flag, nextArg);
            i += 1;
          } else {
            parsed.opts.set(flag, true);
          }
        }
        continue;
      }

      if (this.isSubcommand(arg, subcommands)) {
        parsed.remaining = this.argvs.slice(i);
        break;
      }

      parsed.args.push(arg);
    }

    return parsed;
  }

  private isSubcommand(arg: string, subcommands: Command[]): boolean {
    return subcommands.some((cmd) => {
      const definition = cmd.getDefinition();

      return definition.name === arg || definition.aliases.includes(arg);
    });
  }
}
