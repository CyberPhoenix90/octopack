"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsconfig_mapping_generator_1 = require("tsconfig_mapping_generator");
function loadGeneratorPlugin(plugin) {
    if (typeof plugin === 'string') {
        return initializeGeneratorPlugin(plugin, {});
    }
    else {
        return initializeGeneratorPlugin(plugin.name, plugin.config);
    }
}
exports.loadGeneratorPlugin = loadGeneratorPlugin;
function initializeGeneratorPlugin(name, config) {
    switch (name) {
        case 'tsconfigMappingGenerator':
            return tsconfig_mapping_generator_1.tsconfigMappingGenerator(config);
        default:
            throw new Error(`Generator Plugin ${name} not found`);
    }
}