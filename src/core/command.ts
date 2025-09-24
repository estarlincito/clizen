import { type Alias, alias, type Aliases } from '@/utils/alias.js';

import type { Handler } from './cli.js';

/**
 * Options for configuring a CLI command.
 * Can include a description, repeatable behavior, and additional custom options.
 */
export type CommandOptions = {
  /**
   * Brief description of what the command does.
   */
  description?: string;

  /**
   * Whether the command can be repeated multiple times.
   */
  repeatable?: boolean;
} & Record<string, unknown>;

/**
 * Context provided to a command when executed.
 * Contains parsed options and any subcommands.
 */
export interface CommandContext {
  /**
   * The options passed to the command.
   */
  options?: CommandOptions;

  /**
   * Array of subcommands or arguments provided by the user.
   */
  commands?: string[];
}

/**
 * Represents a CLI command definition.
 */
export interface Command {
  /** Identifies this object as a command */
  type: 'command';

  /** The alias object for the command (e.g., `g` or `greet`) */
  alias: Alias;

  /**
   * Function executed when the command is triggered.
   * Receives the combined CLI context containing commands, flags, and options.
   * Can be synchronous or return a Promise.
   */
  handler: Handler;

  /** Optional configuration options for the command */
  options?: CommandOptions;
}

/**
 * Creates a CLI command definition.
 *
 * @param {Aliases} aliases - Command aliases (string or array of strings). Example: `"g"` or `["g", "greet"]`.
 * @param {Handler} handler - Function to execute when the command is triggered.
 *   Receives `CommandContext` with options and commands. Can be sync or async.
 * @param {CommandOptions} [options] - Optional configuration options for the command.
 *   - `description` – Short description for the command.
 *   - `repeatable` – Allow the command to be repeated.
 *
 * @returns {Command} A command configuration object.
 *
 * @example
 * // Simple synchronous command
 * const greetCommand = command(["g", "greet"], (ctx) => {
 *   console.log("Hello!");
 * });
 *
 * @example
 * // Command with options and async handler
 * const greetAsyncCommand = command(
 *   ["g", "greet"],
 *   async (ctx) => {
 *     await someAsyncSetup(ctx.commands);
 *     console.log("Hello async!");
 *   },
 *   { description: "Greet the user", repeatable: true }
 * );
 */
export const command = (
  aliases: Aliases,
  handler: Handler,
  options?: CommandOptions,
): Command => {
  const commandObj: Command = {
    alias: alias(aliases),
    handler,
    type: 'command',
  };

  if (options) {
    commandObj.options = options;
  }

  return commandObj;
};
