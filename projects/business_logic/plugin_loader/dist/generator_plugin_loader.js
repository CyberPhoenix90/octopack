"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tsconfig_mapping_generator_1 = require("../../plugins/tsconfig_mapping_generator");
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
//# sourceMappingURL=generator_plugin_loader.js.map