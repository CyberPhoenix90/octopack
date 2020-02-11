"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'config_resolver': '../../config_resolver', 'models': '../../models', 'npm_installer': '../../plugins/npm_installer', 'project_importer': '../../plugins/project_importer', 'typescript_plugin': '../../plugins/typescript_plugin', 'meta_programming': '../../plugins/meta_programming', 'barrel_file': '../../plugins/barrel_file', 'output_plugin': '../../plugins/output_plugin', 'runtime': '../../plugins/runtime', 'npm_importer': '../../plugins/npm_importer', 'bundle': '../../plugins/bundle', 'tsconfig_mapping_generator': '../../plugins/tsconfig_mapping_generator' };
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
__export(require("./build_plugin_loader"));
__export(require("./generator_plugin_loader"));