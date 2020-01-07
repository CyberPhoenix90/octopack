"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npm_installer_1 = require("../../plugins/npm_installer");
const project_importer_1 = require("../../plugins/project_importer");
const typescript_plugin_1 = require("../../plugins/typescript_plugin");
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
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}
//# sourceMappingURL=build_plugin_loader.js.map