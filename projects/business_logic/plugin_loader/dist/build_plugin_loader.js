"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npm_installer_1 = require("../../plugins/npm_installer");
const project_importer_1 = require("../../plugins/project_importer");
const typescript_plugin_1 = require("../../plugins/typescript_plugin");
const meta_programming_1 = require("../../plugins/meta_programming");
function loadBuildPlugin(plugin) {
    if (typeof plugin === 'string') {
        return initializePlugin(plugin, {});
    }
    else {
        return initializePlugin(plugin.name, plugin.arguments);
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
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRfcGx1Z2luX2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWxkX3BsdWdpbl9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSwrREFBeUQ7QUFDekQscUVBQWlFO0FBQ2pFLHVFQUE2RDtBQUM3RCxxRUFBaUU7QUFFakUsU0FBZ0IsZUFBZSxDQUFDLE1BQWdDO0lBQy9ELElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1FBQy9CLE9BQU8sZ0JBQWdCLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0tBQ3BDO1NBQU07UUFDTixPQUFPLGdCQUFnQixDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDO0tBQ3ZEO0FBQ0YsQ0FBQztBQU5ELDBDQU1DO0FBRUQsU0FBUyxnQkFBZ0IsQ0FBQyxJQUFZLEVBQUUsSUFBa0I7SUFDekQsUUFBUSxJQUFJLEVBQUU7UUFDYixLQUFLLGlCQUFpQjtZQUNyQixPQUFPLGtDQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsS0FBSyxZQUFZO1lBQ2hCLE9BQU8sOEJBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixLQUFLLFlBQVk7WUFDaEIsT0FBTywwQkFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3pCLEtBQUssaUJBQWlCO1lBQ3JCLE9BQU8sa0NBQWUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUM5QjtZQUNDLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLFlBQVksQ0FBQyxDQUFDO0tBQzdDO0FBQ0YsQ0FBQyJ9