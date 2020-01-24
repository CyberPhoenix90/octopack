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
    else {
        if (process.argv[2]) {
            uiLogger.error(`Could not find script ${process.argv[2]}`);
        }
        else {
            uiLogger.error(`No script specified`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFFQSxPQUFPLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxJQUFJLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxNQUFNLEtBQUssQ0FBQztBQUN2RCxPQUFPLEVBQUUsY0FBYyxFQUFFLE1BQU0saUJBQWlCLENBQUM7QUFDakQsT0FBTyxFQUFFLGlCQUFpQixFQUF5QixNQUFNLGlCQUFpQixDQUFDO0FBQzNFLE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLGFBQWEsQ0FBQztBQUNsRCxPQUFPLEVBQ04scUJBQXFCLEVBQ3JCLG9CQUFvQixFQUNwQixNQUFNLEVBQ04sK0JBQStCLEVBQy9CLHNCQUFzQixFQUN0QixNQUFNLFFBQVEsQ0FBQztBQUNoQixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBRTVCLHNFQUFzRTtBQUN0RSxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ1gsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLEdBQUcsTUFBTSxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztJQUMxRyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDekIsUUFBUSxFQUFFLENBQUM7S0FDWDtJQUVELElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7UUFDakMsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLGlCQUFpQixDQUFDLElBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEVBQUUsbUJBQW1CLENBQUMsQ0FBQztRQUV2RyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDekIsUUFBUSxFQUFFLENBQUM7U0FDWDtRQUVELElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7WUFDakMsT0FBTyxD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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY2xpLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLDZCQUF1RDtBQUN2RCxxREFBaUQ7QUFDakQscURBQW9EO0FBQ3BELDZDQUFrRDtBQUNsRCxtQ0FBc0k7QUFDdEksK0JBQTRCO0FBQzVCLHNFQUFzRTtBQUN0RSxDQUFDLEtBQUssSUFBSSxFQUFFO0lBQ1IsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsY0FBYyxFQUFFLEdBQUcsTUFBTSxtQ0FBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsaUNBQW1CLENBQUMsQ0FBQztJQUMxRyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7UUFDdEIsUUFBUSxFQUFFLENBQUM7S0FDZDtJQUNELElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7UUFDOUIsTUFBTSxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsR0FBRyxNQUFNLG1DQUFpQixDQUFDLFdBQUksQ0FBQyxjQUFjLEVBQUUsSUFBSSxDQUFDLEVBQUUsaUNBQW1CLENBQUMsQ0FBQztRQUN2RyxJQUFJLE1BQU0sS0FBSyxTQUFTLEVBQUU7WUFDdEIsUUFBUSxFQUFFLENBQUM7U0FDZDtRQUNELElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxXQUFXLEVBQUU7WUFDOUIsT0FBTyxDQUFDLEtBQUssQ0FBQyw4Q0FBOEMsTUFBTSxDQUFDLEtBQUssT0FBTyxTQUFTLEVBQUUsQ0FBQyxDQUFDO1lBQzVGLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztTQUNwQjtRQUNELFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxDQUFDLENBQUM7S0FDaEM7U0FDSTtRQUNELFNBQVMsQ0FBQyxNQUFNLEVBQUUsY0FBYyxDQUFDLENBQUM7S0FDckM7QUFDTCxDQUFDLENBQUMsRUFBRSxDQUFDO0FBQ0wsU0FBUyxRQUFRO0lBQ2IsT0FBTyxDQUFDLEtB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