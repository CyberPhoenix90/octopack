
const importData = {'config_resolver': '../../business_logic/config_resolver','models': '../../business_logic/models','compiler': '../../business_logic/compiler','argument_parser': '../../libraries/argument_parser','plugin_loader': '../../business_logic/plugin_loader'}
const mod = require('module');

const original = mod.prototype.require;
mod.prototype.require = function(path, ...args) {
	if (importData[path]) {
		path = importData[path];
		return original.call(module, path, ...args);
	} else {
		return original.call(this, path, ...args);
	}
};

"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
__export(require("./projects/project_crawler"));
__export(require("./scripts/build"));
__export(require("./scripts/generate"));
__export(require("./scripts/script"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLDRCQUE0QixDQUFDO0FBQzNDLGNBQWMsaUJBQWlCLENBQUM7QUFDaEMsY0FBYyxvQkFBb0IsQ0FBQztBQUNuQyxjQUFjLGtCQUFrQixDQUFDIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLGdEQUEyQztBQUMzQyxxQ0FBZ0M7QUFDaEMsd0NBQW1DO0FBQ25DLHNDQUFpQztBQUNqQywwU0FBMFMifQ==