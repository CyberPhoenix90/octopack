import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { join, parse, relative, sep } from 'path';
import { MapLike } from 'typings/common';
import { FileManipulator } from 'static_analyser';

export function barrelFile(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Generating barrel file`);

		const barrelFileContent: string[] = [];

		const optMode: string = 'out';
		const pragma = '@ignore';
		const fileSystem = context.fileSystem;

		const pathToBarrelFileFolder = join(model.project.path, 'src');
		const pathToBarrelFile = join(pathToBarrelFileFolder, 'index.ts');
		if (relative(model.project.path, pathToBarrelFile).startsWith('..')) {
			context.uiLogger.error('Barrel file would be outside of project. Not generating it.');
			return model;
		}

		for (const file of model.files) {
			const { fullPath, content } = file;

			if (fullPath === pathToBarrelFile) {
				continue;
			}

			let includesPragma = false;
			new FileManipulator(content).forEachComment((c) => {
				if (c.includes(pragma)) {
					includesPragma = true;
				}
				return undefined;
			});

			if (
				([
					fullPath.endsWith('.ts'),
					fullPath.endsWith('.tsx'),
					fullPath.endsWith('.js'),
					fullPath.endsWith('.jsx')
				].some((c) => c) &&
					optMode === 'in' &&
					includesPragma) ||
				(optMode === 'out' && !includesPragma)
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
