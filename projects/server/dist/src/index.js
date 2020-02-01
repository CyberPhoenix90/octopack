
const importData = {'api': '../../../api','argument_parser': '../../../libraries/argument_parser','config_resolver': '../../../business_logic/config_resolver','logger': '../../../libraries/logger'}
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
require("./main.js")