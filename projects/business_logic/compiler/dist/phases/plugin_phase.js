"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_loader_1 = require("../../../plugin_loader");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luX3BoYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGx1Z2luX3BoYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMERBQXlEO0FBT2xELEtBQUssVUFBVSx1QkFBdUIsQ0FDNUMsTUFBcUIsRUFDckIsS0FBb0IsRUFDcEIsT0FBc0I7O0lBRXRCLEtBQUssTUFBTSxXQUFXLElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFO1FBQ2xELEtBQUssTUFBTSxLQUFLLElBQUksTUFBTSxFQUFFO1lBQzNCLE1BQU0sU0FBUyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDO1lBQ2pFLE1BQU0sY0FBYyxHQUFHLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsY0FBYyxDQUFDO1lBQzdFLE1BQU0sWUFBWSxHQUNqQixXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLENBQUM7WUFDN0YsT0FBTyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsa0JBQWtCLFNBQVMsUUFBUSxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDO1lBRXJHLEtBQUssTUFBTSxNQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsWUFBWSxJQUFJLEVBQUUsQ0FBQyxFQUFFLEdBQUcsY0FBYyxDQUFDLEVBQUU7Z0JBQ2xFLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSztnQkFDdEIsWUFBWTtnQkFDWixrQkFBa0IsV0FBQSxNQUFNLDBDQUFFLElBQUksdUNBQUksTUFBTSxDQUFBLFFBQVEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQ3pGLENBQUM7Z0JBQ0YsTUFBTSxHQUFHLEdBQUcsTUFBTSwrQkFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO2dCQUMxQyxNQUFNLEdBQUcsQ0FBQyxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7YUFDaEM7U0FDRDtLQUNEO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDO0FBekJELDBEQXlCQztBQUVNLEtBQUssVUFBVSxnQkFBZ0IsQ0FDckMsSUFBOEMsRUFDOUMsS0FBb0IsRUFDcEIsT0FBc0I7SUFFdEIsT0FBTyx1QkFBdUIsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztBQUN4RCxDQUFDO0FBTkQsNENBTUMifQ==