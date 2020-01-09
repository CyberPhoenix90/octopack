import { ScriptContext, CompilerModel } from 'models';
import { relative, join, parse } from 'path';

export async function outputPhase(model: CompilerModel, context: ScriptContext): Promise<CompilerModel> {
	for (const p of model.projectsBuildData) {
		const base = findLowestCommonFolder(Object.keys(p.outFiles));
		for (const file of Object.values(p.outFiles)) {
			await context.fileSystem.writeFile(
				join(
					p.project.path,
					p.project.resolvedConfig.build.bundles[p.bundle].output,
					relative(base, file.fullPath)
				),
				file.content
			);
		}
	}

	return model;
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
