import { MapLike } from '../../../../../typings/common';
import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { transpile } from './module_transpiler';
import { relative, join, parse } from 'path';

export function output(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		await transpile(model, context);
		const base = findLowestCommonFolder(Object.keys(model.outFiles));
		for (const file of Object.values(model.outFiles)) {
			const newPath = join(
				model.project.path,
				model.project.resolvedConfig.build.bundles[model.bundle].output,
				relative(base, file.fullPath)
			);

			await context.fileSystem.mkdirp(parse(newPath).dir);
			await context.fileSystem.writeFile(newPath, file.content);
		}

		return model;
	};
}

function findLowestCommonFolder(files: string[]) {
	if (files.length === 0) {
		return '';
	}

	let candidate = parse(files[0]).dir;
	for (let i = 1; i < files.length; i++) {
		while (!isChildOf(parse(files[i]).dir, candidate)) {
			if (candidate === '/') {
				throw new Error('Could not determine common folder between files in compilation');
			}
			candidate = join(candidate, '..');
		}
	}

	return candidate;
}

function isChildOf(file: string, folder: string): boolean {
	while (file !== '/') {
		if (file === folder) {
			return true;
		} else {
			file = join(file, '..');
		}
	}

	return file === folder;
}
