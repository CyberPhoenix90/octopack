import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { join, parse, relative, sep } from 'path';
import { MapLike } from 'typings/common';
import { FileManipulator } from 'static_analyser';

export function barrelFile(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Generating barrel file`);

		const optMode: string = args.optMode;
		if (optMode !== 'in' && optMode !== 'out') {
			context.uiLogger.error(
				`Expected 'in' or 'out' as optMode but got ${optMode} instead. Not generating barrel file.`
			);
			return model;
		}
		const pragma: string = args.pragma;
		if (typeof pragma !== 'string') {
			context.uiLogger.error(
				`Expected string for pragma but received ${pragma} instead. Not generating barrel file.`
			);
			return model;
		}
		const fromProjectToBarrelFile: string = args.output;
		if (fromProjectToBarrelFile.endsWith('.ts') || fromProjectToBarrelFile.endsWith('.js')) {
			return model;
		}

		const fileSystem = context.fileSystem;
		const barrelFileContent: string[] = [];

		const pathToBarrelFile = join(model.project.path, fromProjectToBarrelFile);
		const pathToBarrelFileFolder = parse(pathToBarrelFile).dir;
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
		}
		return model;
	};
}
