#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
child_process_1.spawnSync(process.argv0, ['--inspect-brk', path_1.join(__dirname, 'index'), ...process.argv.slice(2)], {
    stdio: 'inherit',
    cwd: process.cwd()
});