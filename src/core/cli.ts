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
 * Commands and flags can be marked as `default: true` to execute when no other
 * commands or flags are matched, providing fallback behavior.
 *
 * @param {...(Command|Flag)[]} definitions - List of command or flag definitions.
 * Each definition can include options like `default`, `repeatable`, `defaultValue`,
 * `isBoolean`, `isRequired`, or `choices`.
 * @returns {(argv?: string[]) => Promise<CliContext<typeof definitions>>} A function that,
 * when called with optional arguments, returns a Promise resolving to the combined CLI context.
 * The context contains `commands` (array of matched commands), `flags` (object of flag values),
 * `input` (raw input for the current command/flag), and `options` (merged options).
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
 * // Example 2: Repeatable flag
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
 * // Example 3: Default command
 * // -------------------------------------------------------
 * const defaultCommand = command(
 *   ['start'],
 *   (ctx) => {
 *     console.log(`Hello, ${ctx.input ?? 'World'}!`);
 *   },
 *   { default: true },
 * );
 *
 * const runDefault = cli(defaultCommand);
 * const context3 = await runDefault(['greetings']);
 * // Logs:
 * // "Hello, greetings!"
 * console.log(context3.commands); // ['start']
 * console.log(context3.input);    // 'greetings'
 *
 * const context4 = await runDefault();
 * // Logs:
 * // "Hello, World!"
 * console.log(context4.commands); // ['start']
 *
 * // -------------------------------------------------------
 * // Example 4: Using process.argv.slice(2) for real CLI usage
 * // -------------------------------------------------------
 * // Run from terminal:
 * //   node cli.js hello --name Bob
 * // Execute CLI (defaults to process.argv.slice(2))
 * const context5 = await run();
 * // Logs:
 * // "Name received: Bob"
 * // "Hello command executed!"
 * console.log(context5);
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
    let matchedAny = false;

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
          matchedAny = true;
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
          matchedAny = true;
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
              hasValue = false;
              input = true;
            } else {
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

            if (input !== undefined && input !== true && options?.choices) {
              input = validateChoice(
                input,
                options.choices,
                primaryAlias,
                options.defaultValue,
              );
            }

            values.push(input);

            if (hasValue && nextArg) {
              usedValues.add(nextArg);
              context.input = nextArg;
            } else if (input !== true) {
              context.input = input;
            }
          });

          const finalValue = options?.repeatable
            ? values
            : values[values.length - 1];

          context.flags = {
            ...(context.flags ?? {}),
            [primaryAlias]: finalValue,
          };

          if (options) {
            context.options = { ...context.options, ...options };
          }

          processedFlags.add(primaryAlias);
        } else {
          let value: FlagValue | undefined;

          if (options?.isBoolean) {
            value = options?.defaultValue ?? false;
          } else {
            value = options?.defaultValue;
          }

          if (value !== undefined) {
            context.flags = {
              ...(context.flags ?? {}),
              [primaryAlias]: options?.repeatable ? [value] : value,
            };
          }

          if (options?.isRequired && value === undefined) {
            warn(`Missing required flag: ${primaryAlias}`);
          }
        }
      }
    });

    // PHASE 3: RUN HANDLERS FOR MATCHED DEFINITIONS
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

    // PHASE 4: HANDLE DEFAULT BEHAVIOR
    if (!matchedAny) {
      const defaultDefinitions = definitions.filter(
        (def) => def.options?.default,
      );
      if (defaultDefinitions.length > 1) {
        warn(
          `Multiple default definitions found. Using the first one: ${defaultDefinitions[0].alias.value[0]}`,
        );
      }

      const defaultDefinition = defaultDefinitions[0];
      if (defaultDefinition) {
        const { type, handler, alias, options } = defaultDefinition;
        const primaryAlias = alias.value[0];

        // Update context for default command or flag
        if (type === 'command') {
          context.commands = context.commands ?? [];
          context.commands.push(primaryAlias);

          // Check for unmatched argument to use as input
          if (
            argv.length > 0 &&
            !usedValues.has(argv[0]) &&
            !argv[0].startsWith('-')
          ) {
            context.input = argv[0];
            usedValues.add(argv[0]);
          }
        } else if (type === 'flag') {
          let input: FlagValue = options?.defaultValue ?? true;

          if (
            argv.length > 0 &&
            !usedValues.has(argv[0]) &&
            !argv[0].startsWith('-')
          ) {
            input = argv[0];
            usedValues.add(argv[0]);
            context.input = input;
          }

          if (input !== true && options?.choices) {
            input = validateChoice(
              input,
              options.choices,
              primaryAlias,
              options.defaultValue,
            );
          }

          context.flags = {
            ...(context.flags ?? {}),
            [primaryAlias]: options?.repeatable ? [input] : input,
          };
          processedFlags.add(primaryAlias);
        }

        if (options) {
          context.options = { ...context.options, ...options };
        }

        await Promise.resolve(handler(context)).catch((error) => {
          warn(
            `Error executing default ${type} '${primaryAlias}': ${error.message}`,
          );
        });
      }
    }

    // PHASE 5: VALIDATE UNKNOWN ARGUMENTS
    const unknownArgs = argv.filter((arg) => {
      if (knownAliases.has(arg)) return false;
      if (usedValues.has(arg)) return false;
      if (context.commands?.includes(arg)) return false;
      if (processedFlags.has(arg)) return false;
      if (context.flags && arg in context.flags) return false;
      return true;
    });

    if (unknownArgs.length > 0) {
      warn(`Unknown arguments: ${unknownArgs.join(', ')}`);
    }

    return context as CliContext<TDefinitions>;
  };
