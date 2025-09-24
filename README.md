# Clizen

[![NPM version](https://img.shields.io/npm/v/clizen.svg?style=flat)](https://npmjs.org/package/clizen)

> Lightweight Node.js CLI framework for commands, flags, and interactive prompts.
> Full control over execution — **your CLI, your rules**.

---

## Features ✨

- 🔹 Simple API for commands and flags.
- 🔄 Repeatable commands/flags supported.
- ✅ Input validation: choices, defaults, required.
- 💬 Interactive prompts with async/sync handlers.
- 🌐 TypeScript-ready with strong typings.
- ⚡ Minimal dependencies, lightweight core.
- 🛠️ Default commands/flags for fallback behavior.

---

## Installation 💿

```bash
pnpm add clizen
# or
npm install clizen
# or
yarn add clizen
```

---

## Quick Start 🚀

```ts
#!/usr/bin/env node
import { log } from 'lumilog';
import { cli, command, flag, prompt } from 'clizen';

// Command
const greet = command(['greet'], async (ctx) => {
  const name = ctx.flags?.['--name'] ?? (await prompt('Your name? '));
  log(`Hello, ${name}!`);
});

// Flag
const nameFlag = flag(
  ['--name', '-n'],
  (ctx) => {
    log(`Name via flag: ${ctx.input}`);
  },
  { defaultValue: 'Guest' },
);

// CLI runner
const run = cli(greet, nameFlag);

// Execute CLI (defaults to process.argv.slice(2))
await run();
```

---

## Commands & Flags

### Commands

Actions your CLI performs. Can be `repeatable: true` for multiple occurrences or `default: true` to run when no commands are specified.

```ts
const demo = command(
  ['demo'],
  (ctx) => {
    log(`Demo executed! Flags: ${JSON.stringify(ctx.flags)}`);
  },
  { repeatable: true },
);
```

### Flags

Extra options, can be:

- Boolean: no value needed (`isBoolean: true`)
- Required: warn if missing (`isRequired: true`)
- Defaults: use when not provided (`defaultValue`)
- Choices: allowed values (`choices`)
- Default: run when no flags are specified (`default: true`)

```ts
const verbose = flag(['--verbose', '-v'], () => {}, { isBoolean: true });
```

---

## Default Commands and Flags 🛠️

The `default: true` option allows a command or flag to execute automatically when no other commands or flags are matched in the provided arguments. This is useful for defining fallback behavior, such as displaying a help message or performing a default action.

- **Default Command**: Executes when no commands are provided. If arguments are passed, the first non-flag argument is used as `ctx.input`.
- **Default Flag**: Executes when no flags are provided. If arguments are passed, the first non-flag argument is used as the flag’s value, or `defaultValue` is used if specified.
- **Important**: Only one default definition (command or flag) should be used to avoid ambiguity. If multiple defaults are defined, Clizen warns and uses the first one.

### Example: Default Command

```ts
const defaultCommand = command(
  ['start'],
  (ctx) => {
    log(`Hello, ${ctx.input ?? 'World'}!`);
  },
  { default: true },
);

const run = cli(defaultCommand);

await run(); // Logs: "Hello, World!" (default command, no input)
await run(['start']); // Logs: "Hello, World!" (explicit command)
await run(['greetings']); // Logs: "Hello, greetings!" (default command, uses 'greetings' as input)
await run(['greetings', 'extra']); // Logs: "Hello, greetings!" and warns "Unknown arguments: extra"
```

### Example: Default Flag

```ts
const defaultFlag = flag(
  ['--name', '-n'],
  (ctx) => {
    log(`Name: ${ctx.input}`);
  },
  { default: true, defaultValue: 'Guest' },
);

const run = cli(defaultFlag);

await run(); // Logs: "Name: Guest" (default flag, uses defaultValue)
await run(['Alice']); // Logs: "Name: Alice" (default flag, uses 'Alice' as input)
await run(['--name', 'Bob']); // Logs: "Name: Bob" (explicit flag)
await run(['Alice', 'extra']); // Logs: "Name: Alice" and warns "Unknown arguments: extra"
```

### Notes on Default Behavior

- **Single Default**: Define only one default command or flag to avoid warnings about multiple defaults.
- **Input Handling**: For default commands, the first unmatched argument becomes `ctx.input`. For default flags, it becomes the flag’s value in `ctx.flags['--primary-alias']`.
- **Extra Arguments**: Unmatched arguments after the first are reported as unknown unless consumed by other logic (e.g., repeatable commands/flags).
- **Validation**: For default flags, `ctx.input` is validated against `choices` if specified.

---

## Context Object

Handlers receive:

```ts
interface Context {
  commands?: string[]; // Matched commands
  flags?: Record<string, any>; // Flag values
  input?: string | boolean | number | string[]; // Raw input for current command/flag
  options?: Record<string, any>; // Merged options from commands/flags
}
```

---

## Prompt Utility 💬

Interactive input:

```ts
const answer = await prompt('Favorite language? ');
log(`You said: ${answer}`);
```

- Returns `Promise<string>` with trimmed input.
- Perfect for when a flag or command is missing.

---

## Examples 📚

### Basic Command + Flag

```ts
const helloCommand = command(['hello'], (ctx) => {
  log('Hello command executed!');
});
const nameFlag = flag(
  ['--name', '-n'],
  (ctx) => {
    log(`Name: ${ctx.input}`);
  },
  { defaultValue: 'Guest' },
);

const run = cli(helloCommand, nameFlag);
await run(['hello', '--name', 'Alice']);
```

### Repeatable Flag

```ts
const tagsFlag = flag(
  ['--tag', '-t'],
  (ctx) => {
    log('Tags:', ctx.flags?.['--tag']);
  },
  { repeatable: true },
);

await cli(tagsFlag)(['--tag', 'dev', '--tag', 'prod']);
```

### Default Command with Input

```ts
const defaultCommand = command(
  ['start'],
  (ctx) => {
    log(`Hello, ${ctx.input ?? 'World'}!`);
  },
  { default: true },
);

await cli(defaultCommand)(['greetings']); // Logs: "Hello, greetings!"
```

### Real CLI Usage

```ts
#!/usr/bin/env node
const run = cli(helloCommand, nameFlag);
await run(); // uses process.argv.slice(2)
```

### Interactive Prompt Anywhere

```ts
const ask = command(['ask'], async () => {
  const answer = await prompt('Your name? ');
  log(`Hello, ${answer}!`);
});
```

---

## Best Practices 📝

1. Use **clear aliases** for commands and flags.
2. Set **sensible defaults** for flags and default commands/flags.
3. Validate inputs with `choices` or custom logic.
4. Wrap risky logic in `try/catch`.
5. Combine **prompts and flags** for best UX.
6. Keep CLI output **clean and meaningful**.
7. Use `default: true` sparingly to avoid ambiguous behavior.

---

## License 📄

MIT License – see [LICENSE](LICENSE).
**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
