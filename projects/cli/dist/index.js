#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_resolver_1 = require("../../libraries/config_resolver");
const file_system_1 = require("../../libraries/file_system");
const path_1 = require("path");
const api_1 = require("../../libraries/api");
const logger_1 = require("../../libraries/logger");
const argument_parser_1 = require("../../libraries/argument_parser");
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
        runScript(config, directory);
    }
    else {
        runScript(config, firstDirectory);
    }
})();
function notFound() {
    console.error(`Could not find any octopack configuration. Please run octo from a folder or subfolder that contains a workspace configuration`);
    process.exit(-1);
}
function runScript(config, workspaceRoot) {
    new api_1.Build().run(argument_parser_1.parseArguments(process.argv.slice(2)), {
        workspaceRoot,
        fileSystem: file_system_1.localDiskFileSystem,
        devLogger: new logger_1.Logger({ adapters: [new logger_1.CallbackLoggerAdapter(() => { })], enhancers: [logger_1.PassThroughLoggerEnhancer] }),
        uiLogger: new logger_1.Logger({ adapters: [new logger_1.CallbackLoggerAdapter(() => { })], enhancers: [logger_1.PassThroughLoggerEnhancer] }),
        workspaceConfig: config
    });
}
//# sourceMappingURL=index.js.map