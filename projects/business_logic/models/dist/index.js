
const importData = {'file_system': '../../../libraries/file_system','config_resolver': '../../config_resolver','logger': '../../../libraries/logger'}
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

//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxrTEFBa0wifQ==