"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'config_resolver': '../../business_logic/config_resolver', 'models': '../../business_logic/models', 'argument_parser': '../../libraries/argument_parser', 'compiler': '../../business_logic/compiler', 'plugin_loader': '../../business_logic/plugin_loader' };
const mod = require('module');
const original = mod.prototype.require;
mod.prototype.require = function (path, ...args) {
    if (importData[path]) {
        path = importData[path];
        return original.call(module, path, ...args);
    }
    else {
        return original.call(this, path, ...args);
    }
};
__export(require("./projects/project_crawler"));
__export(require("./projects/project_selector"));
__export(require("./scripts/build"));
__export(require("./scripts/deploy"));
__export(require("./scripts/generate"));
__export(require("./scripts/host"));
__export(require("./scripts/run"));
__export(require("./scripts/script"));
__export(require("./scripts/test"));