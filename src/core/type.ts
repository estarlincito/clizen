import type { Command } from './command.js';

/** Command name */
export type Name = string;

/** Command version */
export type Version = string;

/** Description for commands, arguments, or options */
export type Description = string;

/** Map of option flags to their descriptions */
export type Options = Map<string, string>;

/** Positional arguments of a command */
export type Arguments = {
  /** Argument name, e.g., '<file>' for required, '[dir]' for optional */
  name: `<${string}>` | `[${string}]`;
  /** Description of the argument */
  description: Description;
}[];

/** List of subcommands */
export type Subcommands = Command[];

/** Aliases for a command */
export type Aliases = string[];

/** Array of raw CLI arguments */
export type Argvs = string[];

/** A single CLI flag */
export type Flag = `--${string}`;

/** Result of parsing argv: positional args, options, remaining unparsed */
export interface Parsed {
  args: string[];
  opts: Map<string, boolean | string>;
  remaining: string[];
}

/** Parsed arguments passed to command action */
export interface ParsedArgs {
  args: string[];
  options: {
    [k: string]: string | boolean;
  };
}

/** Action function executed when a command runs */
export type Action = (
  parsedArgs: ParsedArgs,
  command: Command,
) => void | Promise<void>;

/** Full definition of a command, including options, arguments, subcommands, and action */
export type Definition = {
  /** Function to execute */
  action?: Action;
  /** Aliases for this command */
  aliases: Aliases;
  /** Positional arguments */
  arguments: Arguments;
  /** Command description */
  description: Description;
  /** Command name */
  name: Name;
  /** Option flags */
  options: Options;
  /** Subcommands */
  subcommands: Subcommands;
  /** Version string */
  version: Version;
};
