"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'argument_parser': '../../../libraries/argument_parser', 'file_system': '../../../libraries/file_system', 'models': '../../models', 'plugin_loader': '../../plugin_loader', 'config_resolver': '../../config_resolver' };
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
__export(require("./compiler"));
__export(require("./phases/input"));
__export(require("./phases/plugin_phase"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLFlBQVksQ0FBQztBQUMzQixjQUFjLGdCQUFnQixDQUFDO0FBQy9CLGNBQWMsdUJBQXVCLENBQUMifQ==
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE1BQU0sVUFBVSxHQUFHLEVBQUMsaUJBQWlCLEVBQUUsb0NBQW9DLEVBQUMsYUFBYSxFQUFFLGdDQUFnQyxFQUFDLFFBQVEsRUFBRSxjQUFjLEVBQUMsZUFBZSxFQUFFLHFCQUFxQixFQUFDLGlCQUFpQixFQUFFLHVCQUF1QixFQUFDLENBQUE7QUFDdk8sTUFBTSxHQUFHLEdBQUcsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0FBRTlCLE1BQU0sUUFBUSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxDQUFDO0FBQ3ZDLEdBQUcsQ0FBQyxTQUFTLENBQUMsT0FBTyxHQUFHLFVBQVMsSUFBSSxFQUFFLEdBQUcsSUFBSTtJQUM3QyxJQUFJLFVBQVUsQ0FBQyxJQUFJLENBQUMsRUFBRTtRQUNyQixJQUFJLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQ3hCLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDNUM7U0FBTTtRQUNOLE9BQU8sUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7S0FDMUM7QUFDRixDQUFDLENBQUM7QUFFRixnQ0FBMkI7QUFDM0Isb0NBQStCO0FBQy9CLDJDQUFzQztBQUN0QywwUUFBMFEifQ==