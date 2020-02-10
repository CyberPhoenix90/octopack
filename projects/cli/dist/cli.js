#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const api_1 = require("api");
const argument_parser_1 = require("argument_parser");
const config_resolver_1 = require("config_resolver");
const file_system_1 = require("file_system");
const logger_1 = require("logger");
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
    const devLogger = new logger_1.Logger({
        adapters: [new logger_1.WriteFileLoggerAdapter(path_1.join(__dirname, '../log.txt'))],
        enhancers: [new logger_1.LogLevelPrependerLoggerEnhancer()]
    });
    const uiLogger = new logger_1.Logger({
        adapters: [
            new logger_1.ConsoleLoggerAdapter(),
            new logger_1.CallbackLoggerAdapter((log) => { var _a; return devLogger.log((_a = log.text, (_a !== null && _a !== void 0 ? _a : log.object)), log.logLevel); })
        ],
        enhancers: [new logger_1.LogLevelPrependerLoggerEnhancer()]
    });
    if (process.argv[2] === 'build') {
        new api_1.Build().run(argument_parser_1.parseArguments(process.argv.slice(3)), {
            workspaceRoot,
            fileSystem: file_system_1.localDiskFileSystem,
            devLogger: devLogger,
            uiLogger: uiLogger,
            workspaceConfig: config
        });
    }
    else if (process.argv[2] === 'generate') {
        new api_1.Generate().run(argument_parser_1.parseArguments(process.argv.slice(3)), {
            workspaceRoot,
            fileSystem: file_system_1.localDiskFileSystem,
            devLogger: devLogger,
            uiLogger: uiLogger,
            workspaceConfig: config
        });
    }
    else if (process.argv[2] === 'run') {
        new api_1.Run().run(argument_parser_1.parseArguments(process.argv.slice(3)), {
            workspaceRoot,
            fileSystem: file_system_1.localDiskFileSystem,
            devLogger: devLogger,
            uiLogger: uiLogger,
            workspaceConfig: config
        });
    }
    else if (process.argv[2] === 'host') {
        new api_1.Host().run(argument_parser_1.parseArguments(process.argv.slice(3)), {
            workspaceRoot,
            fileSystem: file_system_1.localDiskFileSystem,
            devLogger: devLogger,
            uiLogger: uiLogger,
            workspaceConfig: config
        });
    }
    else if (process.argv[2] === 'test') {
        new api_1.Test().run(argument_parser_1.parseArguments(process.argv.slice(3)), {
            workspaceRoot,
            fileSystem: file_system_1.localDiskFileSystem,
            devLogger: devLogger,
            uiLogger: uiLogger,
            workspaceConfig: config
        });
    }
    else if (process.argv[2] === 'deploy') {
        new api_1.Deploy().run(argument_parser_1.parseArguments(process.argv.slice(3)), {
            workspaceRoot,
            fileSystem: file_system_1.localDiskFileSystem,
            devLogger: devLogger,
            uiLogger: uiLogger,
            workspaceConfig: config
        });
    }
    else {
        if (process.argv[2]) {
            uiLogger.error(`Could not find script ${process.argv[2]}`);
        }
        else {
            uiLogger.error(`No script specified`);
        }
    }
}