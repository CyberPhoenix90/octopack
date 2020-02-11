"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npm_installer_1 = require("npm_installer");
const project_importer_1 = require("project_importer");
const typescript_plugin_1 = require("typescript_plugin");
const meta_programming_1 = require("meta_programming");
const barrel_file_1 = require("barrel_file");
const output_plugin_1 = require("output_plugin");
const runtime_1 = require("runtime");
const npm_importer_1 = require("npm_importer");
const bundle_1 = require("bundle");
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
        case 'npmImporter':
            return npm_importer_1.npmImporter(args);
        case 'typescript':
            return typescript_plugin_1.typescript(args);
        case 'npmInstall':
            return npm_installer_1.npmInstall(args);
        case 'metaProgramming':
            return meta_programming_1.metaProgramming(args);
        case 'barrelFile':
            return barrel_file_1.barrelFile(args);
        case 'bundle':
            return bundle_1.bundle(args);
        case 'output':
            return output_plugin_1.output(args);
        case 'runtime':
            return runtime_1.runtime(args);
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}