#!/usr/bin/env node

import { spawnSync } from 'child_process';
import { join } from 'path';

spawnSync(process.argv0, ['--inspect-brk', join(__dirname, 'index'), ...process.argv.slice(2)], {
	stdio: 'inherit',
	cwd: process.cwd()
});
