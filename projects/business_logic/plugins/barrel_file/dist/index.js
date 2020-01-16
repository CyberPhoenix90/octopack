
const importData = {'models': '../../../models','static_analyser': '../../../../libraries/static_analyser'}
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
__export(require("./barrel_file"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLGVBQWUsQ0FBQyJ9
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLG1DQUE4QjtBQUM5QiwwTUFBME0ifQ==