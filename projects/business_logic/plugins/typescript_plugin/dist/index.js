"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'models': '../../../models', 'file_system': '../../../../libraries/file_system' };
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
__export(require("./typescript"));
__export(require("./typescript_compiler"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLGNBQWMsQ0FBQztBQUM3QixjQUFjLHVCQUF1QixDQUFDIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE1BQU0sVUFBVSxHQUFHLEVBQUMsUUFBUSxFQUFFLGlCQUFpQixFQUFDLGFBQWEsRUFBRSxtQ0FBbUMsRUFBQyxDQUFBO0FBQ25HLE1BQU0sR0FBRyxHQUFHLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztBQUU5QixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sQ0FBQztBQUN2QyxHQUFHLENBQUMsU0FBUyxDQUFDLE9BQU8sR0FBRyxVQUFTLElBQUksRUFBRSxHQUFHLElBQUk7SUFDN0MsSUFBSSxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7UUFDckIsSUFBSSxHQUFHLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUN4QixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQzVDO1NBQU07UUFDTixPQUFPLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQzFDO0FBQ0YsQ0FBQyxDQUFDO0FBRUYsa0NBQTZCO0FBQzdCLDJDQUFzQztBQUN0QywwT0FBME8ifQ==