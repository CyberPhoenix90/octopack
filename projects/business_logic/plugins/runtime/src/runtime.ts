import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { MapLike } from '../../../../../typings/common';
import { parse, join, relative } from 'path';

export function runtime(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		let path: string = join(model.project.path, args.out);
		let handleExisting: 'append' | 'replace' | 'prepend' = args.handleExisting ?? 'replace';

		let runtime: string = `${args.header ?? ''}`;
		if (model.projectDependencies.size) {
			runtime += `
${createImportMap(model, path)}
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
`;
		}
		runtime += `${args.footer ?? ''}`;

		if (await model.fileSystem.exists(path)) {
			let existing: string;
			switch (handleExisting) {
				case 'append':
					existing = await model.fileSystem.readFile(path, 'utf8');
					await model.fileSystem.writeFile(path, `${existing}\n${runtime}`);
					break;
				case 'replace':
					await model.fileSystem.writeFile(path, runtime);
					break;
				case 'prepend':
					existing = await model.fileSystem.readFile(path, 'utf8');
					await model.fileSystem.writeFile(path, `${runtime}\n${existing}`);
					break;
			}
		} else {
			await model.fileSystem.writeFile(path, runtime);
		}

		return model;
	};
}

function createImportMap(model: ProjectBuildData, path: string): string {
	const result: string[] = [];
	for (const dep of model.projectDependencies) {
		result.push(`'${dep.resolvedConfig.name}': '${relative(parse(path).dir, dep.path)}'`);
	}

	return `const importData = {${result.join(',')}}`;
}
