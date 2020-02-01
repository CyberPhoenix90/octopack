import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { FileManipulator } from 'static_analyser';
import { isImportDeclaration } from 'typescript';
import { MapLike } from '../../../../../typings/common';
import { join } from 'path';
import { webpack } from './webpack';

export function npmImporter(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		if (['node', 'electron'].includes(model.project.resolvedConfig.platform)) {
			return model;
		}
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping npm imports`);
		if (!(await model.fileSystem.exists(join(model.project.path, 'package.json')))) {
			throw new Error(`Project ${model.project.resolvedConfig.name} is missing a package.json`);
		}

		const packageJson = JSON.parse(
			await model.fileSystem.readFile(join(model.project.path, 'package.json'), 'utf8')
		);

		const toLoad: Set<string> = new Set();
		for (const file of model.input) {
			if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
				await findDependencies(file, model, packageJson, toLoad);
			}
		}

		for (const name of toLoad) {
			await loadPackage(model, name);
		}
		return model;
	};
}

async function findDependencies(
	file: string,
	model: ProjectBuildData,
	packageJson: any,
	toLoad: Set<string>
): Promise<void> {
	const fm = new FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
	fm.queryAst((node) => {
		if (isImportDeclaration(node)) {
			if (node.moduleSpecifier) {
				const moduleName: string = (node.moduleSpecifier as any).text;
				if (!moduleName.startsWith('.')) {
					const [name] = moduleName.split('/');
					const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
					if (!target) {
						if (packageJson.dependencies[name]) {
							toLoad.add(name);
						}
					}
				}
			}
			return [];
		} else {
			return [];
		}
	});
}

async function loadPackage(model: ProjectBuildData, pkg: string) {
	const result = await webpack.createBundle(model.fileSystem, {
		moduleName: pkg,
		externals: {},
		mode: 'production',
		entry: join(model.project.path, 'node_modules', pkg, 'package.json')
	});

	await model.fileSystem.mkdirp(join(model.project.path, 'build_assets', pkg));
	await model.fileSystem.writeFile(join(model.project.path, 'build_assets', pkg, 'bundle.js'), result);
}
