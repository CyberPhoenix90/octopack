"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const plugin_loader_1 = require("../../../plugin_loader");
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
            const run = await plugin_loader_1.loadBuildPlugin(plugin);
            await run(projectData, context);
        }
    }
    return model;
}
exports.pluginBasedPhase = pluginBasedPhase;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGx1Z2luX3BoYXNlLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGx1Z2luX3BoYXNlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsMERBQXlEO0FBR2xELEtBQUssVUFBVSxnQkFBZ0IsQ0FDckMsSUFBOEMsRUFDOUMsS0FBb0IsRUFDcEIsT0FBc0I7O0lBRXRCLE9BQU8sQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLGtCQUFrQixJQUFJLEVBQUUsQ0FBQyxDQUFDO0lBQ2pELEtBQUssTUFBTSxXQUFXLElBQUksS0FBSyxDQUFDLGlCQUFpQixFQUFFO1FBQ2xELE1BQU0sWUFBWSxHQUFHLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1RyxJQUFJLENBQUMsWUFBWSxFQUFFO1lBQ2xCLFNBQVM7U0FDVDtRQUVELEtBQUssTUFBTSxNQUFNLElBQUksWUFBWSxFQUFFO1lBQ2xDLE9BQU8sQ0FBQyxTQUFTLENBQUMsS0FBSztZQUN0QixZQUFZO1lBQ1osa0JBQWtCLFdBQUEsTUFBTSwwQ0FBRSxJQUFJLHVDQUFJLE1BQU0sQ0FBQSxRQUFRLFdBQVcsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksRUFBRSxDQUN6RixDQUFDO1lBQ0YsTUFBTSxHQUFHLEdBQUcsTUFBTSwrQkFBZSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1lBQzFDLE1BQU0sR0FBRyxDQUFDLFdBQVcsRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNoQztLQUNEO0lBRUQsT0FBTyxLQUFLLENBQUM7QUFDZCxDQUFDO0FBdkJELDRDQXVCQyJ9