"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npm_installer_1 = require("npm_installer");
const project_importer_1 = require("project_importer");
const typescript_plugin_1 = require("typescript_plugin");
const meta_programming_1 = require("meta_programming");
const barrel_file_1 = require("barrel_file");
const output_plugin_1 = require("output_plugin");
const runtime_1 = require("runtime");
function loadBuildPlugin(plugin) {
    if (typeof plugin === 'string') {
        return initializePlugin(plugin, {});
    }
    else {
        return initializePlugin(plugin.name, plugin.config);
    }
}
exports.loadBuildPlugin = loadBuildPlugin;
function initializePlugin(name, args) {
    switch (name) {
        case 'projectImporter':
            return project_importer_1.projectImporter(args);
        case 'typescript':
            return typescript_plugin_1.typescript(args);
        case 'npmInstall':
            return npm_installer_1.npmInstall(args);
        case 'metaProgramming':
            return meta_programming_1.metaProgramming(args);
        case 'barrelFile':
            return barrel_file_1.barrelFile(args);
        case 'output':
            return output_plugin_1.output(args);
        case 'runtime':
            return runtime_1.runtime(args);
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRfcGx1Z2luX2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWxkX3BsdWdpbl9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBR0EsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLGVBQWUsQ0FBQztBQUMzQyxPQUFPLEVBQUUsZUFBZSxFQUFFLE1BQU0sa0JBQWtCLENBQUM7QUFDbkQsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLG1CQUFtQixDQUFDO0FBQy9DLE9BQU8sRUFBRSxlQUFlLEVBQUUsTUFBTSxrQkFBa0IsQ0FBQztBQUNuRCxPQUFPLEVBQUUsVUFBVSxFQUFFLE1BQU0sYUFBYSxDQUFDO0FBQ3pDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxlQUFlLENBQUM7QUFDdkMsT0FBTyxFQUFFLE9BQU8sRUFBRSxNQUFNLFNBQVMsQ0FBQztBQUVsQyxNQUFNLFVBQVUsZUFBZSxDQUFDLE1BQWdDO0lBQy9ELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1FBQy9CLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO1NBQU07UUFDTixPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0tBQ3BEO0FBQ0YsQ0FBQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsSUFBWSxFQUFFLElBQWtCO0lBQ3pELFFBQVEsSUFBSSxFQUFFO1FBQ2IsS0FBSyxpQkFBaUI7WUFDckIsT0FBTyxlQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsS0FBSyxZQUFZO1lBQ2hCLE9BQU8sVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLEtBQUssWUFBWTtZQUNoQixPQUFPLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixLQUFLLGlCQUFpQjtZQUNyQixPQUFPLGVBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QixLQUFLLFlBQVk7WUFDaEIsT0FBTyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsS0FBSyxRQUFRO1lBQ1osT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsS0FBSyxTQUFTO1lBQ2IsT0FBTyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDdEI7WUFDQyxNQUFNLElBQUksS0FBSyxDQUFDLFVBQVUsSUFBSSxZQUFZLENBQUMsQ0FBQztLQUM3QztBQUNGLENBQUMifQ==
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRfcGx1Z2luX2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWxkX3BsdWdpbl9sb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpREFBMkM7QUFDM0MsdURBQW1EO0FBQ25ELHlEQUErQztBQUMvQyx1REFBbUQ7QUFDbkQsNkNBQXlDO0FBQ3pDLGlEQUF1QztBQUN2QyxxQ0FBa0M7QUFDbEMsU0FBZ0IsZUFBZSxDQUFDLE1BQU07SUFDbEMsSUFBSSxPQUFPLE1BQU0sS0FBSyxRQUFRLEVBQUU7UUFDNUIsT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLENBQUM7S0FDdkM7U0FDSTtRQUNELE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUM7S0FDdkQ7QUFDTCxDQUFDO0FBUEQsMENBT0M7QUFDRCxTQUFTLGdCQUFnQixDQUFDLElBQUksRUFBRSxJQUFJO0lBQ2hDLFFBQVEsSUFBSSxFQUFFO1FBQ1YsS0FBSyxpQkFBaUI7WUFDbEIsT0FBTyxrQ0FBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLEtBQUssWUFBWTtZQUNiLE9BQU8sOEJBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixLQUFLLFlBQVk7WUFDYixPQUFPLDBCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUIsS0FBSyxpQkFBaUI7WUFDbEIsT0FBTyxrQ0FBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ2pDLEtBQUssWUFBWTtZQUNiLE9BQU8sd0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM1QixLQUFLLFFBQVE7WUFDVCxPQUFPLHNCQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsS0FBSyxTQUFTO1lBQ1YsT0FBTyxpQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCO1lBQ0ksTUFBTSxJQUFJLEtBQUssQ0FBQyxVQUFVLElBQUksWUFBWSxDQUFDLENBQUM7S0FDbkQ7QUFDTCxDQUFDO0FBQ0QsMGdEQUEwZ0QifQ==