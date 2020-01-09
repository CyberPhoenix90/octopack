'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const static_analyser_1 = require('../../../../libraries/static_analyser');
const typescript_1 = require('typescript');
const path_1 = require('path');
function projectImporter(args) {
	return async (model, context) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
		for (const file of model.files) {
			if (file.fullPath.endsWith('.ts') || file.fullPath.endsWith('.tsx')) {
				remapImports(file, model);
			}
		}
		return model;
	};
}
exports.projectImporter = projectImporter;
function remapImports(file, model) {
	const fm = new static_analyser_1.FileManipulator(file.content);
	fm.queryAst((node) => {
		if (typescript_1.isImportDeclaration(node)) {
			if (node.moduleSpecifier) {
				const moduleName = node.moduleSpecifier.text;
				if (!moduleName.startsWith('.')) {
					const [name, ...path] = moduleName.split('/');
					const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
					if (target) {
						if (model.selectedProjects.includes(target)) {
							model.projectDependencies.add(target);
						}
						const newName = path_1.relative(path_1.parse(file.fullPath).dir, target.path);
						return [
							{
								start: node.moduleSpecifier.getStart() + 1,
								end: node.moduleSpecifier.getEnd() - 1,
								replacement: [newName, ...path].join('/')
							}
						];
					}
				}
			}
			return [];
		} else {
			return [];
		}
	});
	fm.applyManipulations();
	file.content = fm.content;
}
//# sourceMappingURL=project_importer.js.map
