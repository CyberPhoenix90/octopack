"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vm = require("vm");
class FileSystem {
    async import(path) {
        return runModule(await this.readFile(path, 'utf8'));
    }
    importSync(path) {
        return runModule(this.readFileSync(path, 'utf8'));
    }
}
exports.FileSystem = FileSystem;
function runModule(code) {
    const sandboxContext = { module: { exports: undefined } };
    vm.createContext(sandboxContext);
    vm.runInContext(`((module) => {${code}})(module)`, sandboxContext);
    return sandboxContext.module.exports;
}
//# sourceMappingURL=file_system.js.map