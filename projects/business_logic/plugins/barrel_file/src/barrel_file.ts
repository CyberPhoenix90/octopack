import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { FileManipulator } from 'static_analyser';
import { join, relative, sep, parse } from 'path';
import { MapLike } from '../../../../../typings/common';

export function barrelFile(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		if (model.project.resolvedConfig.build.assembly === 'executable') {
			return model;
		}

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

		const barrelFileContent: string[] = [];

		const pathToBarrelFile = join(model.project.path, fromProjectToBarrelFile);
		const pathToBarrelFileFolder = parse(pathToBarrelFile).dir;
		if (relative(model.project.path, pathToBarrelFile).startsWith('..')) {
			context.uiLogger.error('Barrel file would be outside of project. Not generating it.');
			return model;
		}

		for (const file of model.input) {
			if (file === pathToBarrelFile) {
				continue;
			}

			let includesPragma = false;
			new FileManipulator(await model.fileSystem.readFile(file, 'utf8')).forEachComment((c) => {
				if (c.includes(pragma)) {
					includesPragma = true;
				}
				return undefined;
			});

			if (
				(['.ts', '.tsx', '.js', '.jsx'].some((c) => file.endsWith(c)) && optMode === 'in' && includesPragma) ||
				(optMode === 'out' && !includesPragma)
			) {
				const parsedExportPath = parse(relative(pathToBarrelFileFolder, file));
				let exportPath = join(parsedExportPath.dir, parsedExportPath.name);
				if (!exportPath.startsWith(`.${sep}`)) {
					exportPath = `.${sep}${exportPath}`;
				}

				barrelFileContent.push(`export * from '${exportPath}';\n`);
			}
		}

		if (barrelFileContent.length) {
			await model.fileSystem.writeFile(pathToBarrelFile, barrelFileContent.join(''));
		}
		return model;
	};
}
