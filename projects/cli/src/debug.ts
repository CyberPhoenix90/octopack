#!/usr/bin/env node

import { spawnSync } from 'child_process';

spawnSync(process.argv0, ['--inspect-brk', './dist/index', ...process.argv.slice(2)], {
	stdio: 'inherit',
	cwd: process.cwd()
});
