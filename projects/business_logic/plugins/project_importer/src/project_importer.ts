import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { FileManipulator } from 'static_analyser';
import { isImportDeclaration } from 'typescript';
import { MapLike } from '../../../../../typings/common';

export function projectImporter(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
		model.project.projectDependencies = new Set();
		for (const file of model.input) {
			if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
				await findDependencies(file, model);
			}
		}
		return model;
	};
}

async function findDependencies(file: string, model: ProjectBuildData): Promise<void> {
	const fm = new FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
	fm.queryAst((node) => {
		if (isImportDeclaration(node)) {
			if (node.moduleSpecifier) {
				const moduleName: string = (node.moduleSpecifier as any).text;
				if (!moduleName.startsWith('.')) {
					const [name] = moduleName.split('/');
					const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
					if (target) {
						model.project.projectDependencies.add(target);
					}
				}
			}
			return [];
		} else {
			return [];
		}
	});
}
