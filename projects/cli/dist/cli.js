#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_resolver_1 = require("config_resolver");
const file_system_1 = require("file_system");
const path_1 = require("path");
const api_1 = require("api");
const logger_1 = require("logger");
const argument_parser_1 = require("argument_parser");
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
    else {
        if (process.argv[2]) {
            uiLogger.error(`Could not find script ${process.argv[2]}`);
        }
        else {
            uiLogger.error(`No script specified`);
        }
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2xpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vc3JjL2NsaS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFFQSxxREFBMkU7QUFDM0UsNkNBQWtEO0FBQ2xELCtCQUE0QjtBQUM1Qiw2QkFBc0M7QUFDdEMsbUNBTWdCO0FBQ2hCLHFEQUFpRDtBQUVqRCxzRUFBc0U7QUFDdEUsQ0FBQyxLQUFLLElBQUksRUFBRTtJQUNYLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLGNBQWMsRUFBRSxHQUFHLE1BQU0sbUNBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFFLGlDQUFtQixDQUFDLENBQUM7SUFDMUcsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO1FBQ3pCLFFBQVEsRUFBRSxDQUFDO0tBQ1g7SUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO1FBQ2pDLE1BQU0sRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLEdBQUcsTUFBTSxtQ0FBaUIsQ0FBQyxXQUFJLENBQUMsY0FBYyxFQUFFLElBQUksQ0FBQyxFQUFFLGlDQUFtQixDQUFDLENBQUM7UUFFdkcsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO1lBQ3pCLFFBQVEsRUFBRSxDQUFDO1NBQ1g7UUFFRCxJQUFJLE1BQU0sQ0FBQyxLQUFLLEtBQUssV0FBVyxFQUFFO1lBQ2pDLE9BQU8sQ0FBQyxLQUFLLENBQUMsOENBQThDLE1BQU0sQ0FBQyxLQUFLLE9BQU8sU0FBUyxFQUFFLENBQUMsQ0FBQztZQUM1RixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7U0FDakI7UUFDRCxTQUFTLENBQUMsTUFBTSxFQUFFLFNBQVMsQ0FBQyxDQUFDO0tBQzdCO1NBQU07UUFDTixTQUFTLENBQUMsTUFBTSxFQUFFLGNBQWMsQ0FBQyxDQUFDO0tBQ2xDO0FBQ0YsQ0FBQyxDQUFDLEVBQUUsQ0FBQztBQUVMLFNBQVMsUUFBUTtJQUNoQixPQUFPLENBQUMsS0FBSyxDQUNaLCtIQUErSCxDQUMvSCxDQUFDO0lBQ0YsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ2xCLENBQUM7QUFFRCxTQUFTLFNBQVMsQ0FBQyxNQUE2QixFQUFFLGFBQXFCO0lBQ3RFLE1BQU0sU0FBUyxHQUFHLElBQUksZUFBTSxDQUFDO1FBQzVCLFFBQVEsRUFBRSxDQUFDLElBQUksK0JBQXNCLENBQUMsV0FBSSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsQ0FBQyxDQUFDO1FBQ3JFLFNBQVMsRUFBRSxDQUFDLElBQUksd0NBQStCLEVBQUUsQ0FBQztLQUNsRCxDQUFDLENBQUM7SUFDSCxNQUFNLFFBQVEsR0FBRyxJQUFJLGVBQU0sQ0FBQztRQUMzQixRQUFRLEVBQUU7WUFDVCxJQUFJLDZCQUFvQixFQUFFO1lBQzFCLElBQUksOEJBQXFCLENBQUMsQ0FBQyxHQUFHLEVBQUUsRUFBRSxXQUFDLE9BQUEsU0FBUyxDQUFDLEdBQUcsT0FBQyxHQUFHLENBQUMsSUFBSSx1Q0FBSSxHQUFHLENBQUMsTUFBTSxJQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsQ0FBQSxFQUFBLENBQUM7U0FDdkY7UUFDRCxTQUFTLEVBQUUsQ0FBQyxJQUFJLHdDQUErQixFQUFFLENBQUM7S0FDbEQsQ0FBQyxDQUFDO0lBRUgsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLE9BQU8sRUFBRTtRQUNoQyxJQUFJLFdBQUssRUFBRSxDQUFDLEdBQUcsQ0FBQyxnQ0FBYyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7WUFDdEQsYUFBYTtZQUNiLFVBQVUsRUFBRSxpQ0FBbUI7WUFDL0IsU0FBUyxFQUFFLFNBQVM7WUFDcEIsUUFBUSxFQUFFLFFBQVE7WUFDbEIsZUFBZSxFQUFFLE1BQU07U0FDdkIsQ0FBQyxDQUFDO0tBQ0g7U0FBTSxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssVUFBVSxFQUFFO1FBQzFDLElBQUksY0FBUSxFQUFFLENBQUMsR0FBRyxDQUFDLGdDQUFjLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRTtZQUN6RCxhQUFhO1lBQ2IsVUFBVSxFQUFFLGlDQUFtQjtZQUMvQixTQUFTLEVBQUUsU0FBUztZQUNwQixRQUFRLEVBQUUsUUFBUTtZQUNsQixlQUFlLEVBQUUsTUFBTTtTQUN2QixDQUFDLENBQUM7S0FDSDtTQUFNO1FBQ04sSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFO1lBQ3BCLFFBQVEsQ0FBQyxLQUFLLENBQUMseUJBQXlCLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDO1NBQzNEO2FBQU07WUFDTixRQUFRLENBQUMsS0FBSyxDQUFDLHFCQUFxQixDQUFDLENBQUM7U0FDdEM7S0FDRDtBQUNGLENBQUMifQ==