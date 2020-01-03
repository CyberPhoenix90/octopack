"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("../../../plugins/typescript");
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
        case 'typescript':
            return typescript_1.typescript(args);
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}
//# sourceMappingURL=plugin_loader.js.map