"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'argument_parser': '../../../libraries/argument_parser', 'file_system': '../../../libraries/file_system', 'models': '../../models', 'config_resolver': '../../config_resolver', 'plugin_loader': '../../plugin_loader' };
const virtualFiles = {};
const mod = require('module');
const { resolve, relative } = require('path');
const original = mod.prototype.require;
mod.prototype.require = function (path, ...args) {
    let resolvedPath = path;
    if (resolvedPath.startsWith('.')) {
        resolvedPath = relative(__dirname, resolve(module.path, path));
        if (virtualFiles[resolvedPath]) {
            const code = virtualFiles[resolvedPath];
            code(require, exports, module);
            return;
        }
        else {
            return original.call(this, path, ...args);
        }
    }
    else if (importData[resolvedPath]) {
        resolvedPath = importData[resolvedPath];
        return original.call(module, resolvedPath, ...args);
    }
    else {
        return original.call(this, path, ...args);
    }
};
__export(require("./compiler"));
__export(require("./phases/input"));
__export(require("./phases/plugin_phase"));