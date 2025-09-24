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

Actions your CLI performs. Can be `repeatable: true` for multiple occurrences.

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

```ts
const verbose = flag(['--verbose', '-v'], () => {}, { isBoolean: true });
```

---

## Context Object

Handlers receive:

```ts
interface Context {
  commands?: string[]; // Matched commands
  flags?: Record<string, any>; // Flag values
  input?: string | boolean | number; // Raw input for current flag
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
2. Set **sensible defaults** for flags.
3. Validate inputs with `choices` or custom logic.
4. Wrap risky logic in `try/catch`.
5. Combine **prompts and flags** for best UX.
6. Keep CLI output **clean and meaningful**.

---

## License 📄

MIT License – see [LICENSE](LICENSE).
**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
