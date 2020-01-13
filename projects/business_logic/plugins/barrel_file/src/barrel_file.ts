import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { join, relative, sep, parse } from 'path';
import { MapLike } from 'typings/common';

export function barrelFile(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Generating barrel file`);

		const barrelFileContent: string[] = [];

		const optMode: string = 'out';
		const pragma = '@/ignore'.replace('/', ''); // so the file doesn't include the pragma wrongly
		const fileSystem = context.fileSystem;

		const pathToBarrelFileFolder = join(model.project.path, 'src');
		const pathToBarrelFile = join(pathToBarrelFileFolder, 'index.ts');
		if (relative(model.project.path, pathToBarrelFile).startsWith('..')) {
			context.uiLogger.error('Barrel file would be outside of project. Not generating it.');
			return model;
		}

		for (const file of model.files) {
			const { fullPath } = file;

			if (fullPath === pathToBarrelFile) {
				continue;
			}

			if (
				([
					fullPath.endsWith('.ts'),
					fullPath.endsWith('.tsx'),
					fullPath.endsWith('.js'),
					fullPath.endsWith('.jsx')
				].some((c) => c) &&
					optMode === 'in' &&
					file.content.includes(pragma)) ||
				(optMode === 'out' && !file.content.includes(pragma))
			) {
				const parsedExportPath = parse(relative(pathToBarrelFileFolder, file.fullPath));
				let exportPath = join(parsedExportPath.dir, parsedExportPath.name);
				if (!exportPath.startsWith(`.${sep}`)) {
					exportPath = `.${sep}${exportPath}`;
				}

				barrelFileContent.push(`export * from '${exportPath}';\n`);
			}
		}

		if (barrelFileContent.length) {
			fileSystem.writeFileSync(pathToBarrelFile, barrelFileContent.join(''));
			// model.files.push({
			// 	fullPath: pathToBarrelFile,
			// 	parent: undefined,
			// 	type: FileSystemEntryType.FILE,
			// 	content: barrelFileContent.join('')
			// });
		}
		return model;
	};
}
