
const importData = {'api': '../../../api','argument_parser': '../../../libraries/argument_parser','config_resolver': '../../../business_logic/config_resolver','logger': '../../../libraries/logger'}
const virtualFiles = {}
const mod = require('module');
const {resolve, relative} = require('path');

const original = mod.prototype.require;
mod.prototype.require = function(path, ...args) {

	let resolvedPath = path;
	if(resolvedPath.startsWith('.')) {
		resolvedPath = relative(__dirname,resolve(module.path, path))
		if(virtualFiles[resolvedPath]) {
			const code = virtualFiles[resolvedPath];
			code(require, exports, module);
			return;
		} else {
			return original.call(this, path, ...args);
		}
	} else if (importData[resolvedPath]) {
		resolvedPath = importData[resolvedPath];
		return original.call(module, resolvedPath, ...args);
	} else {
		return original.call(this, path, ...args);
	}
};
require("./main.js")