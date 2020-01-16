import { CompilerModel, ScriptContext } from '../../../models/dist';
import { OctopackBuildBundle, OctopackBuildPluginModel } from 'config_resolver';
export declare type PhaseConfig = keyof OctopackBuildBundle['compilation'] | {
    name: keyof OctopackBuildBundle['compilation'];
    defaultPlugins: OctopackBuildPluginModel[];
};
export declare function pluginBasedChainedPhase(phases: PhaseConfig[], model: CompilerModel, context: ScriptContext): Promise<CompilerModel>;
export declare function pluginBasedPhase(name: keyof OctopackBuildBundle['compilation'], model: CompilerModel, context: ScriptContext): Promise<CompilerModel>;
//# sourceMappingURL=plugin_phase.d.ts.map