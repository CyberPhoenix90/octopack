"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_loader_1 = require("../utilities/plugin_loader");
async function pluginBasedPhase(name, model, context) {
    var _a, _b;
    context.devLogger.info(`Starting Phase ${name}`);
    for (const projectData of model.projectsBuildData) {
        const phasePlugins = projectData.project.resolvedConfig.build.bundles[projectData.bundle].compilation[name];
        if (!phasePlugins) {
            continue;
        }
        for (const plugin of phasePlugins) {
            context.devLogger.debug(
            //@ts-ignore
            `Running plugin ${_b = (_a = plugin) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : plugin)} for ${projectData.project.resolvedConfig.name}`);
            await plugin_loader_1.loadPlugin(plugin)(projectData, context);
        }
    }
    return model;
}
exports.pluginBasedPhase = pluginBasedPhase;
//# sourceMappingURL=plugin_phase.js.map