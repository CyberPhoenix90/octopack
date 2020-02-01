#!/usr/bin/env node
const importData = {'api': '../../api','argument_parser': '../../libraries/argument_parser','config_resolver': '../../business_logic/config_resolver','file_system': '../../libraries/file_system','logger': '../../libraries/logger'}
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
require("./cli.js")