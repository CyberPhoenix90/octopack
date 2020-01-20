import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { FileManipulator } from 'static_analyser';
import { isImportDeclaration } from 'typescript';
import { MapLike } from '../../../../../typings/common';

export function projectImporter(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
		for (const file of model.input) {
			if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
				await remapImports(file, model);
			}
		}
		return model;
	};
}

async function remapImports(file: string, model: ProjectBuildData): Promise<void> {
	const fm = new FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
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
	await model.fileSystem.writeFile(file, fm.content);
}
