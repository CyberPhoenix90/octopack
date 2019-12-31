#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_resolver_1 = require("../../libraries/config_resolver");
const file_system_1 = require("../../libraries/file_system");
const path_1 = require("path");
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
            debugger;
            console.error(`Expected to find workspace scope but found ${config.scope} at ${directory}`);
            process.exit(-1);
        }
        discoverWorkspace(config);
    }
    else {
        discoverWorkspace(config);
    }
})();
function notFound() {
    console.error(`Could not find any octopack configuration. Please run octo from a folder or subfolder that contains a workspace configuration`);
    process.exit(-1);
}
function discoverWorkspace(config) {
    console.log(config);
}
//# sourceMappingURL=index.js.map