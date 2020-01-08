import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { MapLike } from '../../../../../typings/common';
import { VirtualFile } from 'file_system';
import { FileManipulator } from 'static_analyser';
import { isImportDeclaration } from 'typescript';
import { parse, relative } from 'path';

export function projectImporter(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
		for (const file of model.files) {
			if (file.fullPath.endsWith('.ts') || file.fullPath.endsWith('.tsx')) {
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
					const [name, ...path] = moduleName.split('/');
					const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
					if (target) {
						model.projectDependencies.add(target);
						const newName = relative(parse(file.fullPath).dir, target.path);
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
