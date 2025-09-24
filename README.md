# Clizen

[![NPM version](https://img.shields.io/npm/v/clizen.svg?style=flat)](https://npmjs.org/package/clizen)

> A lightweight Node.js CLI framework for defining commands, flags, and interactive prompts.
> Full control over execution and default behavior — **your CLI, your rules**.

Clizen gives you a **minimal but flexible structure** to build CLI tools in **Node.js**, fully compatible with **TypeScript**, and supports **async/sync handlers** seamlessly.

---

## Features ✨

- 🔹 **Simple API** – Define commands and flags with intuitive handlers.
- 🚀 **Flexible CLI** – You decide exactly how your app behaves.
- ⚡ **Lightweight** – Minimal dependencies, easy to integrate.
- 🌐 **TypeScript Ready** – Strong typings for safety and DX.
- 🛠 **Custom Defaults** – Handle the "no args" case your way.
- 🔄 **Repeatable Commands/Flags** – Multiple occurrences supported out of the box.
- ✅ **Input Validation** – Choices, defaults, and required flags.
- 💬 **Interactive Prompts** – Ask the user for input at runtime.
- ⏳ **Async + Sync Support** – All handlers support both styles.

---

## Installation 💿

```bash
# Using npm
npm install clizen

# Using pnpm
pnpm add clizen

# Using yarn
yarn add clizen
```

---

## Quick Start 🚀

```ts
#!/usr/bin/env node
import { log } from 'lumilog';
import { cli, command, flag, prompt } from 'clizen';

// Define a command
const greetCommand = command(['greet', 'hello'], async (ctx) => {
  // Interactive prompt if no name flag provided
  const name = ctx.flags?.['--name'] ?? (await prompt('Enter your name: '));
  log(`Hello, ${name}! 👋`);
});

// Define a flag
const nameFlag = flag(
  ['--name', '-n'],
  (ctx) => {
    log(`Name received via flag: ${ctx.input}`);
  },
  { defaultValue: 'Guest' },
);

// Boolean flag
const versionFlag = flag(
  ['--version', '-v'],
  () => {
    log('clizen v1.0.0');
  },
  { isBoolean: true },
);

// Create CLI processor
const run = cli(greetCommand, nameFlag, versionFlag);

// Execute CLI with command-line arguments
const context = await run(process.argv.slice(2));

// Default behavior if nothing recognized
if (!context.commands?.length && !Object.keys(context.flags || {}).length) {
  log('✨ Welcome to Clizen! Use --help to see available options.');
}
```

---

## CLI Structure 📦

### Commands

Commands represent actions your CLI performs.
They can be **repeatable** if needed.

```ts
const demo = command(
  ['demo'],
  (ctx) => {
    log(`Demo executed! Flags: ${JSON.stringify(ctx.flags)}`);
  },
  { repeatable: true },
);
```

---

### Flags

Flags add extra options to your commands.

```ts
const verbose = flag(
  ['--verbose', '-v'],
  (ctx) => {
    log('Verbose mode ON');
  },
  { isBoolean: true },
);
```

---

### Context Object

Every `handler` receives a **context object** containing all parsed commands, flags, and options.

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

The built-in `prompt` utility lets you ask the user for input interactively:

```ts
import { prompt } from 'clizen';

(async () => {
  const answer = await prompt('Your favorite language? ');
  console.log(`You said: ${answer}`);
})();
```

- Returns a `Promise<string>` with trimmed user input.
- Perfect for when a flag or command isn't provided.

---

## Flag Options 🔧

| Option         | Type    | Description                             |
| -------------- | ------- | --------------------------------------- |
| `isBoolean`    | boolean | Flag does **not** consume next argument |
| `isRequired`   | boolean | Warn if the flag is missing             |
| `repeatable`   | boolean | Allows multiple occurrences             |
| `defaultValue` | any     | Value if flag is not provided           |
| `choices`      | any\[]  | Allowed values for validation           |

---

## Real-World Example 🏗️

```ts
const build = command(['build', 'b'], (ctx) => {
  const env = ctx.flags?.['--env'] || 'production';
  log(`Building project in ${env} mode`);
});

const envFlag = flag(
  ['--env', '-e'],
  (ctx) => {
    log(`Environment set: ${ctx.input}`);
  },
  {
    defaultValue: 'development',
    choices: ['development', 'production', 'test'],
  },
);

const run = cli(build, envFlag);
await run(process.argv.slice(2));
```

Interactive prompts can be added anywhere:

```ts
const askUser = command(['ask'], async () => {
  const answer = await prompt('What is your name? ');
  log(`Hello, ${answer}!`);
});
```

---

## Error Handling ⚠️

Every handler is automatically wrapped in `try/catch`.
You can also add your own error handling inside the handler:

```ts
const risky = flag(
  ['--file', '-f'],
  (ctx) => {
    try {
      const content = readFileSync(ctx.input, 'utf-8');
      log(content);
    } catch (err) {
      warn(`Error reading file: ${err.message}`);
    }
  },
  { isRequired: true },
);
```

---

## Usage Examples 📚

### Example 1: Basic Command + Flag

```ts
const helloCommand = command(['hello'], (ctx) => {
  console.log('Hello command executed!');
});

const nameFlag = flag(
  ['--name', '-n'],
  (ctx) => {
    console.log(`Name received: ${ctx.input}`);
  },
  { defaultValue: 'Guest' },
);

const run = cli(helloCommand, nameFlag);

const context = await run(['hello', '--name', 'Alice']);
// Logs:
// "Name received: Alice"
// "Hello command executed!"
```

---

### Example 2: Repeatable Flag

```ts
const tagsFlag = flag(
  ['--tag', '-t'],
  (ctx) => {
    console.log('Tags:', ctx.flags?.['--tag']);
  },
  { repeatable: true },
);

const run = cli(tagsFlag);

await run(['--tag', 'dev', '--tag', 'prod']);
// Logs: Tags: ['dev', 'prod']
```

---

### Example 3: Real CLI Usage

```ts
#!/usr/bin/env node
const run = cli(helloCommand, nameFlag);

await run(process.argv.slice(2));
// Example CLI call: node cli.js hello --name Bob
// Logs:
// "Name received: Bob"
// "Hello command executed!"
```

---

## Best Practices 📝

1. **Use clear aliases** for commands and flags.
2. **Set sensible defaults** for flags.
3. **Validate inputs** using `choices` or custom validation.
4. Always wrap risky logic in **try/catch**.
5. Combine **prompts and flags** for the best user experience.
6. Keep CLI output clean and meaningful.

---

## License 📄

MIT License – see [LICENSE](LICENSE) for details.
**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
