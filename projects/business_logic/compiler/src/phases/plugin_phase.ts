import { CompilerModel, ScriptContext } from '../../../models/dist';
import { loadPlugin } from '../utilities/plugin_loader';
import { OctopackBuildBundle } from '../../../config_resolver';

export async function pluginBasedPhase(
	name: keyof OctopackBuildBundle['compilation'],
	model: CompilerModel,
	context: ScriptContext
): Promise<CompilerModel> {
	context.devLogger.info(`Starting Phase ${name}`);
	for (const projectData of model.projectsBuildData) {
		const phasePlugins = projectData.project.resolvedConfig.build.bundles[projectData.bundle].compilation[name];
		if (!phasePlugins) {
			continue;
		}

		for (const plugin of phasePlugins) {
			context.devLogger.debug(
				//@ts-ignore
				`Running plugin ${plugin?.name ?? plugin} for ${projectData.project.resolvedConfig.name}`
			);
			await loadPlugin(plugin)(projectData, context);
		}
	}

	return model;
}
