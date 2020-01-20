'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const module_transpiler_1 = require('./module_transpiler');
const path_1 = require('path');
function output(args) {
	return async (model, context) => {
		await module_transpiler_1.transpile(model, context);
		const base = findLowestCommonFolder(model.output);
		for (const file of model.output) {
			const newPath = path_1.join(
				model.project.path,
				model.project.resolvedConfig.build.bundles[model.bundle].output,
				path_1.relative(base, file)
			);
			await context.fileSystem.mkdirp(path_1.parse(newPath).dir);
			await context.fileSystem.writeFile(newPath, await model.fileSystem.readFile(file, 'utf8'));
		}
		return model;
	};
}
exports.output = output;
function findLowestCommonFolder(files) {
	if (files.length === 0) {
		return '';
	}
	let candidate = path_1.parse(files[0]).dir;
	for (let i = 1; i < files.length; i++) {
		while (!isChildOf(path_1.parse(files[i]).dir, candidate)) {
			if (candidate === '/') {
				throw new Error('Could not determine common folder between files in compilation');
			}
			candidate = path_1.join(candidate, '..');
		}
	}
	return candidate;
}
function isChildOf(file, folder) {
	while (file !== '/') {
		if (file === folder) {
			return true;
		} else {
			file = path_1.join(file, '..');
		}
	}
	return file === folder;
}
