"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("../../../plugins/typescript");
const npm_installer_1 = require("../../../plugins/npm_installer");
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
        case 'npmInstall':
            return npm_installer_1.npmInstall(args);
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}
//# sourceMappingURL=plugin_loader.js.map