import { VirtualFile } from 'file_system';
import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { FileManipulator } from 'static_analyser';
import { isImportDeclaration } from 'typescript';
import { MapLike } from '../../../../../typings/common';

export function projectImporter(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
		for (const file of model.files) {
			if (
				file.fullPath.endsWith('.ts') ||
				file.fullPath.endsWith('.tsx') ||
				file.fullPath.endsWith('.js') ||
				file.fullPath.endsWith('.jsx')
			) {
				remapImports(file, model);
			}
		}
		return model;
	};
}

function remapImports(file: VirtualFile, model: ProjectBuildData) {
	const fm = new FileManipulator(file.content);
	fm.queryAst((node) => {
		if (isImportDeclaration(node)) {
			if (node.moduleSpecifier) {
				const moduleName: string = (node.moduleSpecifier as any).text;
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
	file.content = fm.content;
}
