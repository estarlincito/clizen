import { handleError } from '@/utils/error.js';

import { HelpCommand } from './help.js';
import { ParseCommand } from './parser.js';
import { RunCommand } from './run.js';
import type {
  Action,
  Aliases,
  Arguments,
  Argvs,
  Definition,
  Description,
  Flag,
  Name,
  Options,
  Subcommands,
  Version,
} from './type.js';

/**
 * Core class to define CLI commands, subcommands, options, arguments, and actions.
 */
export class Command {
  #name: Name = '';
  #version: Version = '';
  #description: Description = '';
  readonly #options: Options = new Map<string, string>();
  readonly #arguments: Arguments = [];
  #action?: Action;
  readonly #subcommands: Subcommands = [];
  readonly #aliases: Aliases = [];

  /** Returns the internal definition of the command, including name, description, options, arguments, subcommands, etc. */
  getDefinition(): Definition {
    return {
      action: this.#action,
      aliases: this.#aliases,
      arguments: this.#arguments,
      description: this.#description,
      name: this.#name,
      options: this.#options,
      subcommands: this.#subcommands,
      version: this.#version,
    };
  }

  /** Sets the name of the command. */
  name(name: Name): this {
    this.#name = name;
    return this;
  }

  /** Sets the version of the command. */
  version(version: Version): this {
    this.#version = version;
    return this;
  }

  /** Sets the description of the command. */
  description(description: Description): this {
    this.#description = description;
    return this;
  }

  /**
   * Defines an option/flag for the command.
   * @param flag - Must start with '--'.
   * @param description - Description of the option.
   */
  option(flag: Flag, description: Description): this {
    if (!/^--[a-zA-Z0-9][\w-]*$/.test(flag)) {
      throw handleError(`Invalid option flag: ${flag}`);
    }
    this.#options.set(flag, description);
    return this;
  }

  /**
   * Defines a positional argument for the command.
   * @param name - Name of the argument, e.g., '<file>' or '[dir]'.
   * @param description - Description of the argument.
   */
  argument(name: Arguments[0]['name'], description: Description): this {
    this.#arguments.push({ description, name });
    return this;
  }

  /** Sets the action function that will run when this command is executed. */
  action(fn: Action) {
    this.#action = fn;
    return this;
  }

  /**
   * Creates a subcommand under this command.
   * @param name - Name of the subcommand.
   * @param description - Description of the subcommand.
   */
  command(name: Name, description: Description): Command {
    const cmd = new Command();
    cmd.#name = name;
    cmd.#description = description;
    this.#subcommands.push(cmd);
    return cmd;
  }

  /** Adds aliases to this command. */
  alias(...names: Name[]): this {
    this.#aliases.push(...names);
    return this;
  }

  /**
   * Parses an array of arguments (default: process.argv.slice(2)) and returns a parsed object.
   */
  parse(argvs: Argvs = process.argv.slice(2)) {
    return new ParseCommand(this, argvs).execute();
  }

  /**
   * Runs the command with the given arguments.
   * Handles flags like --help and --version automatically.
   */
  async run(argvs: Argvs = process.argv.slice(2)) {
    await new RunCommand(this, argvs).execute();
  }

  /** Displays help for this command, optionally showing subcommands. */
  help(showSubcommands: boolean = true): void {
    return new HelpCommand(this, showSubcommands).execute();
  }
}
