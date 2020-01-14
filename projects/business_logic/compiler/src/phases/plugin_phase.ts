import { CompilerModel, ScriptContext } from '../../../models/dist';
import { loadBuildPlugin } from 'plugin_loader';
import { OctopackBuildBundle } from 'config_resolver';

export type PhaseConfig =
	| keyof OctopackBuildBundle['compilation']
	| { name: keyof OctopackBuildBundle['compilation']; defaultPlugins: OctopackBuildPluginModel[] };

export async function pluginBasedChainedPhase(
	phases: PhaseConfig[],
	model: CompilerModel,
	context: ScriptContext
): Promise<CompilerModel> {
	for (const projectData of model.projectsBuildData) {
		for (const phase of phases) {
			const phaseName = typeof phase === 'string' ? phase : phase.name;
			const defaultPlugins = typeof phase === 'string' ? [] : phase.defaultPlugins;
			const phasePlugins =
				projectData.project.resolvedConfig.build.bundles[projectData.bundle].compilation[phaseName];
			context.devLogger.info(`Starting Phase ${phaseName} for ${projectData.project.resolvedConfig.name}`);

			for (const plugin of [...(phasePlugins || []), ...defaultPlugins]) {
				context.devLogger.debug(
					//@ts-ignore
					`Running plugin ${plugin?.name ?? plugin} for ${projectData.project.resolvedConfig.name}`
				);
				const run = await loadBuildPlugin(plugin);
				await run(projectData, context);
			}
		}
	}

	return model;
}

export async function pluginBasedPhase(
	name: keyof OctopackBuildBundle['compilation'],
	model: CompilerModel,
	context: ScriptContext
): Promise<CompilerModel> {
	return pluginBasedChainedPhase([name], model, context);
}
