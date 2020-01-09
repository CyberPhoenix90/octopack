"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const project_crawler_1 = require("../projects/project_crawler");
const script_1 = require("./script");
const plugin_loader_1 = require("../../../business_logic/plugin_loader");
class Generate extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Builds stuff'
        };
    }
    async run(args, context) {
        var _a, _b;
        const projects = await project_crawler_1.projectCrawler.findProjects(context.workspaceRoot, context);
        for (const plugin of context.workspaceConfig.generator) {
            context.devLogger.debug(
            //@ts-ignore
            `Running generator plugin ${_b = (_a = plugin) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : plugin)}`);
            await plugin_loader_1.loadGeneratorPlugin(plugin)(projects, context);
        }
        return {};
    }
}
exports.Generate = Generate;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VuZXJhdGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJnZW5lcmF0ZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLGlFQUE2RDtBQUM3RCxxQ0FBc0Q7QUFDdEQseUVBQTRFO0FBRTVFLE1BQWEsUUFBUyxTQUFRLGVBQU07SUFDNUIsWUFBWTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLElBQUk7UUFDVixPQUFPO1lBQ04sV0FBVyxFQUFFLGNBQWM7U0FDM0IsQ0FBQztJQUNILENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQXFCLEVBQUUsT0FBc0I7O1FBQzdELE1BQU0sUUFBUSxHQUFHLE1BQU0sZ0NBQWMsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxPQUFPLENBQUMsQ0FBQztRQUNuRixLQUFLLE1BQU0sTUFBTSxJQUFJLE9BQU8sQ0FBQyxlQUFlLENBQUMsU0FBUyxFQUFFO1lBQ3ZELE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSztZQUN0QixZQUFZO1lBQ1osNEJBQTRCLFdBQUEsTUFBTSwwQ0FBRSxJQUFJLHVDQUFJLE1BQU0sQ0FBQSxFQUFFLENBQ3BELENBQUM7WUFDRixNQUFNLG1DQUFtQixDQUFDLE1BQU0sQ0FBQyxDQUFDLFFBQVEsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNyRDtRQUVELE9BQU8sRUFBRSxDQUFDO0lBQ1gsQ0FBQztDQUNEO0FBdkJELDRCQXVCQyJ9