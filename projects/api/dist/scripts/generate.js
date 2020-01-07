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
//# sourceMappingURL=generate.js.map