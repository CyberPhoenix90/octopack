'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const static_analyser_1 = require('static_analyser');
const typescript_1 = require('typescript');
function projectImporter(args) {
	return async (model, context) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
		for (const file of model.input) {
			if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
				await remapImports(file, model);
			}
		}
		return model;
	};
}
exports.projectImporter = projectImporter;
async function remapImports(file, model) {
	const fm = new static_analyser_1.FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
	fm.queryAst((node) => {
		if (typescript_1.isImportDeclaration(node)) {
			if (node.moduleSpecifier) {
				const moduleName = node.moduleSpecifier.text;
				if (!moduleName.startsWith('.')) {
					const [name] = moduleName.split('/');
					const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
					if (target) {
						model.projectDependencies.add(target);
					}
				}
			}
			return [];
		} else {
			return [];
		}
	});
	fm.applyManipulations();
	await model.fileSystem.writeFile(file, fm.content);
}
