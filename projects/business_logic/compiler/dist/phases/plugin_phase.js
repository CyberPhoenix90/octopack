"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_loader_1 = require("plugin_loader");
async function pluginBasedChainedPhase(phases, model, context) {
    var _a, _b;
    for (const projectData of model.projectsBuildData) {
        for (const phase of phases) {
            const phaseName = typeof phase === 'string' ? phase : phase.name;
            const defaultPlugins = typeof phase === 'string' ? [] : phase.defaultPlugins;
            const phasePlugins = projectData.project.resolvedConfig.build.bundles[projectData.bundle].compilation[phaseName];
            context.devLogger.info(`Starting Phase ${phaseName} for ${projectData.project.resolvedConfig.name}`);
            for (const plugin of [...(phasePlugins || []), ...defaultPlugins]) {
                context.devLogger.debug(
                //@ts-ignore
                `Running plugin ${_b = (_a = plugin) === null || _a === void 0 ? void 0 : _a.name, (_b !== null && _b !== void 0 ? _b : plugin)} for ${projectData.project.resolvedConfig.name}`);
                const run = await plugin_loader_1.loadBuildPlugin(plugin);
                await run(projectData, context);
            }
        }
    }
    return model;
}
exports.pluginBasedChainedPhase = pluginBasedChainedPhase;
async function pluginBasedPhase(name, model, context) {
    return pluginBasedChainedPhase([name], model, context);
}
exports.pluginBasedPhase = pluginBasedPhase;