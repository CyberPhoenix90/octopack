
const importData = {'config_resolver': '../../config_resolver','models': '../../models','npm_installer': '../../plugins/npm_installer','project_importer': '../../plugins/project_importer','typescript_plugin': '../../plugins/typescript_plugin','meta_programming': '../../plugins/meta_programming','barrel_file': '../../plugins/barrel_file','output_plugin': '../../plugins/output_plugin','runtime': '../../plugins/runtime','tsconfig_mapping_generator': '../../plugins/tsconfig_mapping_generator'}
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
__export(require("./build_plugin_loader"));
__export(require("./generator_plugin_loader"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLHVCQUF1QixDQUFDO0FBQ3RDLGNBQWMsMkJBQTJCLENBQUMifQ==
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJDQUFzQztBQUN0QywrQ0FBMEM7QUFDMUMsOE9BQThPIn0=