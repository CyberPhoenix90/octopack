#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_resolver_1 = require("../../libraries/config_resolver");
const file_system_1 = require("../../libraries/file_system");
config_resolver_1.findConfiguration(process.cwd(), file_system_1.localDiskFileSystem);
