"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'models': '../../../models' };
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
__export(require("./tsconfig_mapping_generator"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLDhCQUE4QixDQUFDIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE1BQU0sVUFBVSxHQUFHLEVBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFDLENBQUE7QUFDaEQsTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRTlCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBSSxFQUFFLEdBQUcsSUFBSTtJQUM3QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNyQixJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDNUM7U0FBTTtRQUNOLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDMUM7QUFDRixDQUFDLENBQUM7QUFFRixrREFBNkM7QUFDN0MsOE1BQThNIn0=