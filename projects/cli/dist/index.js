#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_resolver_1 = require("../../libraries/config_resolver");
const file_system_1 = require("../../libraries/file_system");
const path_1 = require("path");
const api_1 = require("../../libraries/api");
const dist_1 = require("../../libraries/logger/dist");
//Self executing async function due to lack of top level async support
(async () => {
    const { config, directory: firstDirectory } = await config_resolver_1.findConfiguration(process.cwd(), file_system_1.localDiskFileSystem);
    if (config === undefined) {
        notFound();
    }
    if (config.scope !== 'workspace') {
        const { config, directory } = await config_resolver_1.findConfiguration(path_1.join(firstDirectory, '..'), file_system_1.localDiskFileSystem);
        if (config === undefined) {
            notFound();
        }
        if (config.scope !== 'workspace') {
            console.error(`Expected to find workspace scope but found ${config.scope} at ${directory}`);
            process.exit(-1);
        }
        runScript(config);
    }
    else {
        runScript(config);
    }
})();
function notFound() {
    console.error(`Could not find any octopack configuration. Please run octo from a folder or subfolder that contains a workspace configuration`);
    process.exit(-1);
}
function runScript(config) {
    new api_1.Build().run({}, {
        fileSystem: file_system_1.localDiskFileSystem,
        devLogger: new dist_1.Logger(),
        uiLogger: new dist_1.Logger(),
        workspaceConfig: config
    });
}
//# sourceMappingURL=index.js.map