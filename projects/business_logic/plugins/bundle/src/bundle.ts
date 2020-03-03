import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { MapLike } from '../../../../../typings/common';
import { join, relative } from 'path';

export function bundle(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		if (['browser', 'electron'].includes(model.project.resolvedConfig.platform)) {
			throw new Error('Browser and electron are not supported yet by bundle plugin');
		}

		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Creating bundle`);
		const outputDir = join(model.project.path, model.project.resolvedConfig.build.bundles[model.bundle].output);

		for (const file of model.output) {
			if (!file.endsWith('.js')) {
				continue;
			}

			if (file.startsWith(outputDir)) {
				model.project.virtualFileImports.set(
					relative(outputDir, file),
					await model.fileSystem.readFile(file, 'utf8')
				);
			} else {
				model.project.virtualFileImports.set(
					relative(model.project.path, file),
					await model.fileSystem.readFile(file, 'utf8')
				);
			}
		}

		return model;
	};
}
