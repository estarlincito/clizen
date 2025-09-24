import { type Alias, alias, type Aliases } from '@/utils/alias.js';

import type { Handler } from './cli.js';
import type { CommandOptions } from './command.js';

/**
 * Represents the possible value types for a command-line flag.
 * A flag can be a string, boolean, or number.
 */
export type FlagValue = string | boolean | number;

/**
 * Options for configuring a CLI flag.
 * Can include boolean behavior, required status, default values, allowed choices,
 * repeatable behavior, and all command options.
 */
export type FlagOptions = {
  /** Whether the flag must be provided */
  isRequired?: boolean;

  /** Treat the flag as a boolean toggle */
  isBoolean?: boolean;

  /** Default value if the flag is not provided */
  defaultValue?: FlagValue;

  /** Restrict allowed values to this list */
  choices?: FlagValue[];

  /** Allow the flag to be used multiple times */
  repeatable?: boolean;
} & CommandOptions;

/**
 * Context provided to a flag handler when the flag is triggered.
 * Contains parsed options, other flags, and the input value.
 */
export interface FlagContext {
  /** The options configured for this flag */
  options?: FlagOptions;

  /** All parsed flags, with values or arrays if repeatable */
  flags?: Record<string, FlagValue | FlagValue[]>;

  /** The raw input provided to the flag, if any */
  input?: FlagValue;
}

/**
 * Represents a CLI flag definition.
 */
export interface Flag {
  /** Identifies this object as a flag */
  type: 'flag';

  /** The alias object for the flag (e.g., `-v` or `--verbose`) */
  alias: Alias;

  /**
   * Function executed when the flag is triggered.
   * Receives the combined CLI context containing commands, flags, and options.
   * Can be synchronous or return a Promise.
   */
  handler: Handler;

  /** Optional configuration options for the flag */
  options?: FlagOptions;
}

/**
 * Creates a command-line flag definition.
 *
 * A flag represents a configurable command-line option that can be triggered
 * using one or more aliases (e.g., `-h` or `--help`).
 *
 * @param {Aliases} aliases - One or more aliases for the flag.
 *   Example: `"-h"` or `["-h", "--help"]`.
 * @param {Handler} handler - Function to execute when the flag is matched.
 *   Receives the `FlagContext` which contains information about the input, options, and flags.
 *   Can be sync or async (returning a Promise).
 * @param {FlagOptions} [options] - Optional settings to configure the flag behavior.
 *   - `isRequired` – If `true`, the flag must be provided.
 *   - `isBoolean` – If `true`, the flag is treated as a boolean toggle.
 *   - `defaultValue` – Value to use when the flag is not specified.
 *   - `choices` – Restrict flag values to a set of allowed strings or numbers.
 *   - `repeatable` – Allow the flag to be provided multiple times.
 *
 * @returns {Flag} A flag configuration object.
 *
 * @example
 * // Simple synchronous flag
 * const helpFlag = flag(['-h', '--help'], (ctx) => {
 *   console.log('Displaying help menu...');
 * });
 *
 * @example
 * // Flag with options and async handler
 * const portFlag = flag(['-p', '--port'], async (ctx) => {
 *   await someAsyncSetup(ctx.input);
 *   console.log(`Port set to ${ctx.input}`);
 * }, {
 *   isRequired: true,
 *   defaultValue: 3000,
 *   choices: [3000, 4000, 5000],
 * });
 */
export const flag = (
  aliases: Aliases,
  handler: Handler,
  options?: FlagOptions,
): Flag => {
  const flagObj: Flag = {
    alias: alias(aliases),
    handler,
    type: 'flag',
  };

  if (options) {
    flagObj.options = options;
  }

  return flagObj;
};
