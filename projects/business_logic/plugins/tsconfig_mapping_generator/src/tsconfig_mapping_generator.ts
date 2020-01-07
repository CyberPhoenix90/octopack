import { MapLike } from '../../../../../typings/common';
import { OctoPackGeneratorPlugin, ScriptContext, Project } from 'models';
import { join, relative } from 'path';

export function tsconfigMappingGenerator(args: MapLike<any>): OctoPackGeneratorPlugin {
	return async (projects: Project[], context: ScriptContext) => {
		let config;
		if (context.fileSystem.exists(join(context.workspaceRoot, 'tsconfig.json'))) {
			config = JSON.parse(
				await context.fileSystem.readFile(join(context.workspaceRoot, 'tsconfig.json'), 'utf8')
			);
		} else {
			config = {
				compilerOptions: {}
			};
		}
		config.compilerOptions.baseUrl = '.';
		config.compilerOptions.paths = {};
		for (const p of projects) {
			config.compilerOptions.paths[p.resolvedConfig.name] = [relative(context.workspaceRoot, p.path)];
		}

		await context.fileSystem.writeFile(
			join(context.workspaceRoot, 'tsconfig.json'),
			JSON.stringify(config, undefined, 4)
		);
	};
}
