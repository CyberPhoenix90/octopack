"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_plugin_1 = require("../../../plugins/typescript_plugin");
const npm_installer_1 = require("../../../plugins/npm_installer");
const project_importer_1 = require("../../../plugins/project_importer");
const tsconfig_mapping_generator_1 = require("../../../plugins/tsconfig_mapping_generator");
function loadPlugin(plugin) {
    if (typeof plugin === 'string') {
        return initializePlugin(plugin, {});
    }
    else {
        return initializePlugin(plugin.name, plugin.arguments);
    }
}
exports.loadPlugin = loadPlugin;
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
function loadGeneratorPlugin(plugin) {
    if (typeof plugin === 'string') {
        return initializeGeneratorPlugin(plugin, {});
    }
    else {
        return initializeGeneratorPlugin(plugin.name, plugin.arguments);
    }
}
exports.loadGeneratorPlugin = loadGeneratorPlugin;
function initializeGeneratorPlugin(name, args) {
    switch (name) {
        case 'tsconfigMappingGenerator':
            return tsconfig_mapping_generator_1.tsconfigMappingGenerator(args);
        default:
            throw new Error(`Generator Plugin ${name} not found`);
    }
}
//# sourceMappingURL=plugin_loader.js.map