"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npm_installer_1 = require("../../plugins/npm_installer");
const project_importer_1 = require("../../plugins/project_importer");
const typescript_plugin_1 = require("../../plugins/typescript_plugin");
const meta_programming_1 = require("../../plugins/meta_programming");
const barrel_file_1 = require("../../plugins/barrel_file");
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
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGRfcGx1Z2luX2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1aWxkX3BsdWdpbl9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSwrREFBeUQ7QUFDekQscUVBQWlFO0FBQ2pFLHVFQUE2RDtBQUM3RCxxRUFBaUU7QUFDakUsMkRBQXVEO0FBRXZELFNBQWdCLGVBQWUsQ0FBQyxNQUFnQztJQUMvRCxJQUFJLE9BQU8sTUFBTSxLQUFLLFFBQVEsRUFBRTtRQUMvQixPQUFPLGdCQUFnQixDQUFDLE1BQU0sRUFBRSxFQUFFLENBQUMsQ0FBQztLQUNwQztTQUFNO1FBQ04sT0FBTyxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztLQUNwRDtBQUNGLENBQUM7QUFORCwwQ0FNQztBQUVELFNBQVMsZ0JBQWdCLENBQUMsSUFBWSxFQUFFLElBQWtCO0lBQ3pELFFBQVEsSUFBSSxFQUFFO1FBQ2IsS0FBSyxpQkFBaUI7WUFDckIsT0FBTyxrQ0FBZSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzlCLEtBQUssWUFBWTtZQUNoQixPQUFPLDhCQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDekIsS0FBSyxZQUFZO1lBQ2hCLE9BQU8sMEJBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QixLQUFLLGlCQUFpQjtZQUNyQixPQUFPLGtDQUFlLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDOUIsS0FBSyxZQUFZO1lBQ2hCLE9BQU8sd0JBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN6QjtZQUNDLE1BQU0sSUFBSSxLQUFLLENBQUMsVUFBVSxJQUFJLFlBQVksQ0FBQyxDQUFDO0tBQzdDO0FBQ0YsQ0FBQyJ9