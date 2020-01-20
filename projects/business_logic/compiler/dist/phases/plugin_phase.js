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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luX3BoYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3BoYXNlcy9wbHVnaW5fcGhhc2UudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpREFBZ0Q7QUFPekMsS0FBSyxVQUFVLHVCQUF1QixDQUM1QyxNQUFxQixFQUNyQixLQUFvQixFQUNwQixPQUFzQjs7SUFFdEIsS0FBSyxNQUFNLFdBQVcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLEVBQUU7UUFDbEQsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDM0IsTUFBTSxTQUFTLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDakUsTUFBTSxjQUFjLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7WUFDN0UsTUFBTSxZQUFZLEdBQ2pCLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsU0FBUyxRQUFRLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFckcsS0FBSyxNQUFNLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxjQUFjLENBQUMsRUFBRTtnQkFDbEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLO2dCQUN0QixZQUFZO2dCQUNaLGtCQUFrQixXQUFBLE1BQU0sMENBQUUsSUFBSSx1Q0FBSSxNQUFNLENBQUEsUUFBUSxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FDekYsQ0FBQztnQkFDRixNQUFNLEdBQUcsR0FBRyxNQUFNLCtCQUFlLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzFDLE1BQU0sR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQzthQUNoQztTQUNEO0tBQ0Q7SUFFRCxPQUFPLEtBQUssQ0FBQztBQUNkLENBQUM7QUF6QkQsMERBeUJDO0FBRU0sS0FBSyxVQUFVLGdCQUFnQixDQUNyQyxJQUE4QyxFQUM5QyxLQUFvQixFQUNwQixPQUFzQjtJQUV0QixPQUFPLHVCQUF1QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQ3hELENBQUM7QUFORCw0Q0FNQyJ9