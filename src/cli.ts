#!/usr/bin/env node

import { Command } from './index.js';
import { description, name, version } from './utils/pkg.js';

const clizen = new Command();

clizen.name(name).version(version).description(description);

await clizen.run();
