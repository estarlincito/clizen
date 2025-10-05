# Clizen 🛠️

[![NPM version](https://img.shields.io/npm/v/clizen.svg?style=flat)](https://npmjs.org/package/clizen)

> A tiny, flexible CLI toolkit for Node.js to define commands, parse options, and show help effortlessly. 🚀

---

## Features ✨

- 🖥️ Define CLI commands with names, descriptions, versions, and actions.
- 📚 Support for subcommands with their own options and arguments.
- 📖 Automatic `--help` (`-h`) and `--version` (`-v`) flags.
- 🔍 Parse CLI arguments and options (`--flag=value` or `--flag value`).
- 🔗 Add aliases for commands.
- ⚠️ Graceful error handling for unknown commands or invalid flags.
- 🧩 Written in TypeScript for modern development.
- ⚡ Lightweight and intuitive for building CLI tools.

---

## Installation 📲

```bash
npm install clizen
# or
pnpm add clizen
# or
yarn add clizen
```

---

## Usage 🎉

### Run the CLI

```bash
# Show help
clizen --help

# Show version
clizen --version
```

### Define a CLI in your project

```ts
import { cli } from 'clizen';

cli
  .name('clizen')
  .version('0.0.1')
  .description('A tiny, flexible CLI toolkit for Node.js');

cli
  .argument('<projectDir>', 'Project directory to process')
  .option('--minify', 'Minify the output')
  .action(({ args, options }) => {
    console.log('Project directory:', args[0]);
    if (options.minify) console.log('Output will be minified');
  });

cli
  .command('build', 'Build your project')
  .argument('<files>', 'Files to build, e.g., src/**/*.ts')
  .option('--watch', 'Watch files for changes')
  .action(({ args, options }) => {
    console.log('Building files:', args);
    if (options.watch) console.log('Watching files...');
  });

cli.run();
```

---

### Example CLI Output

```bash
$ clizen --help
Usage: clizen [command] [options] <projectDir>

A tiny, flexible CLI toolkit for Node.js

Arguments:
  <projectDir>     Project directory to process

Options:
  --minify         Minify the output
  -h, --help       Display help for command
  -v, --version    Display command version

Commands:
  build            Build your project
```

```bash
$ clizen build src/**/*.ts --watch
Building files: [ 'src/**/*.ts' ]
Watching files...
```

```bash
$ clizen inputDir --minify
Project directory: inputDir
Output will be minified
```

---

## License 📄

MIT License – see [LICENSE](LICENSE).
**Author:** Estarlin R ([estarlincito.com](https://estarlincito.com))
