"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'config_resolver': '../../business_logic/config_resolver', 'models': '../../business_logic/models', 'compiler': '../../business_logic/compiler', 'argument_parser': '../../libraries/argument_parser', 'plugin_loader': '../../business_logic/plugin_loader' };
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
__export(require("./scripts/build"));
__export(require("./scripts/generate"));
__export(require("./scripts/host"));
__export(require("./scripts/run"));
__export(require("./scripts/script"));
__export(require("./scripts/test"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLDRCQUE0QixDQUFDO0FBQzNDLGNBQWMsaUJBQWlCLENBQUM7QUFDaEMsY0FBYyxvQkFBb0IsQ0FBQztBQUNuQyxjQUFjLGdCQUFnQixDQUFDO0FBQy9CLGNBQWMsZUFBZSxDQUFDO0FBQzlCLGNBQWMsa0JBQWtCLENBQUM7QUFDakMsY0FBYyxnQkFBZ0IsQ0FBQyJ9
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE1BQU0sVUFBVSxHQUFHLEVBQUMsaUJBQWlCLEVBQUUsc0NBQXNDLEVBQUMsUUFBUSxFQUFFLDZCQUE2QixFQUFDLFVBQVUsRUFBRSwrQkFBK0IsRUFBQyxpQkFBaUIsRUFBRSxpQ0FBaUMsRUFBQyxlQUFlLEVBQUUsb0NBQW9DLEVBQUMsQ0FBQTtBQUM3USxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFOUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDdkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFJLEVBQUUsR0FBRyxJQUFJO0lBQzdDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JCLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUM1QztTQUFNO1FBQ04sT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUMxQztBQUNGLENBQUMsQ0FBQztBQUVGLGdEQUEyQztBQUMzQyxxQ0FBZ0M7QUFDaEMsd0NBQW1DO0FBQ25DLG9DQUErQjtBQUMvQixtQ0FBOEI7QUFDOUIsc0NBQWlDO0FBQ2pDLG9DQUErQjtBQUMvQixrWUFBa1kifQ==