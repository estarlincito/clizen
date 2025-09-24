import { warn } from 'lumilog';

import { validateChoice } from '@/utils/choice.js';

import { type Command, type CommandContext } from './command.js';
import { type Flag, type FlagContext, type FlagValue } from './flag.js';

/** Combined context for all commands and flags */
export type Context = CommandContext & FlagContext;

/**
 * Function that handles the combined command/flag context.
 */
export type Handler = (context: Context) => void | Promise<void>;

/**
 * Type alias for better readability
 */
type CommandOrFlag = Command | Flag;

/**
 * Computes the combined context for a list of CLI commands and flags.
 */
type CliContext<T extends CommandOrFlag[]> = T extends [
  infer First,
  ...infer Rest,
]
  ? First extends Command
    ? Rest extends CommandOrFlag[]
      ? CliContext<Rest> & CommandContext
      : CommandContext
    : First extends Flag
      ? Rest extends CommandOrFlag[]
        ? CliContext<Rest> & FlagContext
        : FlagContext
      : never
  : unknown;

/**
 * Creates a CLI processor that handles commands and flags.
 *
 * This function parses command-line arguments and executes handlers in the order
 * they were defined. It supports both synchronous and asynchronous handlers.
 *
 * @param {...(Command|Flag)[]} definitions - List of command or flag definitions.
 * @returns {Promise<CliContext<typeof definitions>>} A Promise resolving to the combined CLI context.
 *
 * @example
 * import { cli, command, flag } from 'clizen';
 *
 * // Define a simple command
 * const helloCommand = command(['hello'], (ctx) => {
 *   console.log('Hello command executed!');
 * });
 *
 * // Define a simple flag
 * const nameFlag = flag(
 *   ['--name', '-n'],
 *   (ctx) => {
 *     console.log(`Name received: ${ctx.input}`);
 *   },
 *   { defaultValue: 'Guest' },
 * );
 *
 * // Create CLI processor
 * const run = cli(helloCommand, nameFlag);
 *
 * // -------------------------------------------------------
 * // Example 1: Execute with custom arguments
 * // -------------------------------------------------------
 * const context1 = await run(['hello', '--name', 'Alice']);
 * // Logs:
 * // "Name received: Alice"
 * // "Hello command executed!"
 * console.log(context1.commands); // ['hello']
 * console.log(context1.flags);    // { '--name': 'Alice' }
 *
 * // -------------------------------------------------------
 * // Example 2: Repeatable flag and extra arguments
 * // -------------------------------------------------------
 * const repeatFlag = flag(['-t', '--tag'], (ctx) => {
 *   console.log('Tags:', ctx.flags?.['--tag']);
 * }, { repeatable: true });
 *
 * const runWithRepeatable = cli(repeatFlag);
 * const context2 = await runWithRepeatable(['--tag', 'dev', '--tag', 'prod']);
 * // Logs:
 * // "Tags: ['dev', 'prod']"
 * console.log(context2.flags); // { '--tag': ['dev', 'prod'] }
 *
 * // -------------------------------------------------------
 * // Example 3: Using process.argv.slice(2) for real CLI usage
 * // -------------------------------------------------------
 * // Run from terminal:
 * //   node cli.js hello --name Bob
 * //
 * // This captures actual arguments passed to the script.
 * // No need to pass argv explicitly; defaults to process.argv.slice(2)
 * const context3 = await run();
 * console.log(context3);
 * // Logs:
 * // "Name received: Bob"
 * // "Hello command executed!"
 */
export const cli =
  <TDefinitions extends CommandOrFlag[]>(
    ...definitions: TDefinitions
  ): ((argv?: string[]) => Promise<CliContext<TDefinitions>>) =>
  async (argv: string[] = process.argv.slice(2)) => {
    const context: Context = {
      commands: [],
      flags: {},
      options: {},
    };

    const knownAliases = new Set<string>();
    const usedValues = new Set<string>();
    const processedFlags = new Set<string>();

    // PHASE 1: COLLECT AND VALIDATE ALIASES
    definitions.forEach((definition) => {
      definition.alias.value.forEach((alias) => {
        if (knownAliases.has(alias)) {
          warn(`Duplicate alias: ${alias}`);
        }
        knownAliases.add(alias);
      });
    });

    // PHASE 2: PARSING ARGUMENTS (WITHOUT EXECUTING HANDLERS)
    definitions.forEach((definition) => {
      const { alias, options, type } = definition;
      const aliases = alias.value;
      const primaryAlias = aliases[0];

      if (type === 'command') {
        const commandIndices: number[] = [];
        argv.forEach((arg, index) => {
          if (aliases.includes(arg)) {
            commandIndices.push(index);
          }
        });

        const occurrences = commandIndices.length;

        if (occurrences > 0) {
          if (!options?.repeatable && occurrences > 1) {
            warn(
              `Non-repeatable command ${primaryAlias} specified ${occurrences} times`,
            );
          }

          context.commands = context.commands ?? [];
          const times = options?.repeatable ? occurrences : 1;
          for (let i = 0; i < times; i += 1) {
            context.commands.push(primaryAlias);
          }

          // Merge options
          if (options) {
            context.options = { ...context.options, ...options };
          }
        }
      } else if (type === 'flag') {
        const flagIndices: number[] = [];
        argv.forEach((arg, index) => {
          if (aliases.includes(arg)) {
            flagIndices.push(index);
          }
        });

        const occurrences = flagIndices.length;

        if (occurrences > 0) {
          if (!options?.repeatable && occurrences > 1) {
            warn(
              `Non-repeatable flag ${primaryAlias} specified ${occurrences} times`,
            );
          }

          const values: FlagValue[] = [];

          flagIndices.forEach((flagIndex) => {
            const nextArg = argv[flagIndex + 1];
            let hasValue = false;
            let input: FlagValue = true;

            if (options?.isBoolean) {
              // Boolean flag: never consume the following argument
              hasValue = false;
              input = true;
            } else {
              // Value flag: can consume the following argument
              hasValue = Boolean(
                nextArg && !nextArg.startsWith('-') && !usedValues.has(nextArg),
              );

              if (hasValue) {
                input = nextArg;
              } else if (options?.defaultValue !== undefined) {
                input = options.defaultValue;
              } else {
                input = true;
              }
            }

            // Validate choices if they are defined
            if (input !== undefined && input !== true && options?.choices) {
              input = validateChoice(
                input,
                options.choices,
                primaryAlias,
                options.defaultValue,
              );
            }

            values.push(input);

            // Mark value as used if it was consumed
            if (hasValue && nextArg) {
              usedValues.add(nextArg);
              context.input = nextArg;
            } else if (input !== true) {
              context.input = input;
            }
          });

          // For repeatable flags, use array; but use last value
          const finalValue = options?.repeatable
            ? values
            : values[values.length - 1];

          context.flags = {
            ...(context.flags ?? {}),
            [primaryAlias]: finalValue,
          };

          // Merge options
          if (options) {
            context.options = { ...context.options, ...options };
          }

          processedFlags.add(primaryAlias);
        } else {
          // Flag not present in argv - set default values
          let value: FlagValue | undefined;

          if (options?.isBoolean) {
            value = options?.defaultValue ?? false;
          } else {
            value = options?.defaultValue;
          }

          // Set default value in context
          if (value !== undefined) {
            context.flags = {
              ...(context.flags ?? {}),
              [primaryAlias]: options?.repeatable ? [value] : value,
            };
          }

          // Validate flag required
          if (options?.isRequired && value === undefined) {
            warn(`Missing required flag: ${primaryAlias}`);
          }
        }
      }
    });

    // PHASE 3: RUN HANDLERS IN ORDER OF DEFINITION
    const promises = [];
    for (const definition of definitions) {
      const { type, handler, alias } = definition;
      const primaryAlias = alias.value[0];
      let wasMatched = false;

      if (type === 'command') {
        if (context.commands?.includes(primaryAlias)) {
          wasMatched = true;
        }
      } else if (type === 'flag') {
        if (processedFlags.has(primaryAlias)) {
          wasMatched = true;
        }
      }

      if (wasMatched) {
        promises.push(
          Promise.resolve(handler(context)).catch((error) => {
            warn(`Error executing ${type} '${primaryAlias}': ${error.message}`);
          }),
        );
      }
    }

    await Promise.all(promises);

    // PHASE 4: VALIDATE UNKNOWN ARGUMENTS
    const unknownArgs = argv.filter((arg) => {
      // If it is a known alias, it has already been processed
      if (knownAliases.has(arg)) return false;
      // If it was used as a flag value, it is not unknown
      if (usedValues.has(arg)) return false;
      // If it is a processed command
      if (context.commands?.includes(arg)) return false;
      // If it is a processed flag (by its primary alias)
      if (processedFlags.has(arg)) return false;
      // If it is in the context flags (it can be a secondary alias)
      if (context.flags && arg in context.flags) return false;

      return true;
    });

    if (unknownArgs.length > 0) {
      warn(`Unknown arguments: ${unknownArgs.join(', ')}`);
    }

    return context as CliContext<TDefinitions>;
  };
