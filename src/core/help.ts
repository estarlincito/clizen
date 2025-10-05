import { log } from 'lumilog';

import type { Command } from './command.js';

/**
 * Displays help information for a CLI command, including usage,
 * description, arguments, options, and subcommands.
 */
export class HelpCommand {
  /**
   * @param command The command to show help for
   * @param showSubcommands Whether to list subcommands (default: true)
   */
  constructor(
    private readonly command: Command,
    private readonly showSubcommands = true,
  ) {}

  /** Executes the help display */
  execute() {
    this.printUsage();
    this.printDescription();
    this.printArguments();
    this.printOptions();
    this.printSubcommands();
    log('');
  }

  private printUsage() {
    const {
      name,
      arguments: args,
      options,
      subcommands,
    } = this.command.getDefinition();

    const commandsStr = subcommands.length > 0 ? '[command]' : '';
    const optionsStr = options.size > 0 ? '[options]' : '';
    const argsStr = args.map((a) => a.name).join(' ');

    log(
      `\nUsage: ${name}${commandsStr ? ` ${commandsStr}` : ''}${optionsStr ? ` ${optionsStr}` : ''}${argsStr ? ` ${argsStr}` : ''}`,
    );
  }
  private printDescription() {
    const { description } = this.command.getDefinition();
    if (description) {
      log(`\n${description}`);
    }
  }

  private printArguments() {
    const { arguments: args } = this.command.getDefinition();
    if (args.length > 0) {
      log('\nArguments:');
      args.forEach((arg) => {
        log(`  ${arg.name.padEnd(15)} ${arg.description}`);
      });
    }
  }

  private printOptions() {
    const { options } = this.command.getDefinition();
    log('\nOptions:');
    const allOptions = new Map([
      ...options,
      ['-h, --help', 'Display help for command'],
      ['-v, --version', 'Display command version'],
    ]);

    allOptions.forEach((desc, flag) => {
      log(`  ${flag.padEnd(20)} ${desc}`);
    });
  }

  private printSubcommands() {
    const { subcommands } = this.command.getDefinition();
    if (this.showSubcommands && subcommands.length > 0) {
      log('\nCommands:');
      subcommands.forEach((cmd) => {
        const cmdCtx = cmd.getDefinition();

        const aliases =
          cmdCtx.aliases.length > 0
            ? ` (aliases: ${cmdCtx.aliases.join(', ')})`
            : '';
        log(`  ${cmdCtx.name.padEnd(15)} ${cmdCtx.description}${aliases}`);
      });
    }
  }
}
