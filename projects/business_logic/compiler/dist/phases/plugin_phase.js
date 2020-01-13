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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luX3BoYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGx1Z2luX3BoYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUNBLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQztBQU96RCxNQUFNLENBQUMsS0FBSyxVQUFVLHVCQUF1QixDQUM1QyxNQUFxQixFQUNyQixLQUFvQixFQUNwQixPQUFzQjs7SUFFdEIsS0FBSyxNQUFNLFdBQVcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLEVBQUU7UUFDbEQsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDM0IsTUFBTSxTQUFTLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDakUsTUFBTSxjQUFjLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7WUFDN0UsTUFBTSxZQUFZLEdBQ2pCLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RixPQUFPLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxrQkFBa0IsU0FBUyxRQUFRLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7WUFFckcsS0FBSyxNQUFNLE1BQU0sSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLElBQUksRUFBRSxDQUFDLEVBQUUsR0FBRyxjQUFjLENBQUMsRUFBRTtnQkFDbEUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLO2dCQUN0QixZQUFZO2dCQUNaLGtCQUFrQixXQUFBLE1BQU0sMENBQUUsSUFBSSx1Q0FBSSxNQUFNLENBQUEsUUFBUSxXQUFXLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEVBQUUsQ0FDekYsQ0FBQztnQkFDRixNQUFNLEdBQUcsR0FBRyxNQUFNLGVBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ2hDO1NBQ0Q7S0FDRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQztBQUVELE1BQU0sQ0FBQyxLQUFLLFVBQVUsZ0JBQWdCLENBQ3JDLElBQThDLEVBQzlDLEtBQW9CLEVBQ3BCLE9BQXNCO0lBRXRCLE9BQU8sdUJBQXVCLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7QUFDeEQsQ0FBQyJ9
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luX3BoYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGx1Z2luX3BoYXNlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsMERBQXlEO0FBQ2xELEtBQUssVUFBVSx1QkFBdUIsQ0FBQyxNQUFNLEVBQUUsS0FBSyxFQUFFLE9BQU87SUFDaEUsSUFBSSxFQUFFLEVBQUUsRUFBRSxDQUFDO0lBQ1gsS0FBSyxNQUFNLFdBQVcsSUFBSSxLQUFLLENBQUMsaUJBQWlCLEVBQUU7UUFDL0MsS0FBSyxNQUFNLEtBQUssSUFBSSxNQUFNLEVBQUU7WUFDeEIsTUFBTSxTQUFTLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUM7WUFDakUsTUFBTSxjQUFjLEdBQUcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxjQUFjLENBQUM7WUFDN0UsTUFBTSxZQUFZLEdBQUcsV0FBVyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUMsV0FBVyxDQUFDLFNBQVMsQ0FBQyxDQUFDO1lBQ2pILE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixTQUFTLFFBQVEsV0FBVyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQztZQUNyRyxLQUFLLE1BQU0sTUFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLFlBQVksSUFBSSxFQUFFLENBQUMsRUFBRSxHQUFHLGNBQWMsQ0FBQyxFQUFFO2dCQUMvRCxPQUFPLENBQUMsU0FBUyxDQUFDLEtBQUs7Z0JBQ3ZCLFlBQVk7Z0JBQ1osa0JBQWtCLEVBQUUsR0FBRyxDQUFDLEVBQUUsR0FBRyxNQUFNLENBQUMsS0FBSyxJQUFJLElBQUksRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxDQUFDLEVBQUUsS0FBSyxJQUFJLElBQUksRUFBRSxLQUFLLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxRQUFRLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUFDLENBQUM7Z0JBQ2xMLE1BQU0sR0FBRyxHQUFHLE1BQU0sK0JBQWUsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDMUMsTUFBTSxHQUFHLENBQUMsV0FBVyxFQUFFLE9BQU8sQ0FBQyxDQUFDO2FBQ25DO1NBQ0o7S0FDSjtJQUNELE9BQU8sS0FBSyxDQUFDO0FBQ2pCLENBQUM7QUFsQkQsMERBa0JDO0FBQ00sS0FBSyxVQUFVLGdCQUFnQixDQUFDLElBQUksRUFBRSxLQUFLLEVBQUUsT0FBTztJQUN2RCxPQUFPLHVCQUF1QixDQUFDLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0FBQzNELENBQUM7QUFGRCw0Q0FFQztBQUNELGtyREFBa3JEIn0=