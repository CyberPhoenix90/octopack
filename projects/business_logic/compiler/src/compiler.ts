import { ParsedArguments } from '../../../libraries/argument_parser';
import { CompilerModel, Project, ScriptContext } from '../../models';
import { inputPhase } from './phases/input';
import { pluginBasedPhase } from './phases/plugin_phase';

export class Compiler {
	public async compile(projects: Project[], context: ScriptContext, args: ParsedArguments): Promise<void> {
		let compileModel: CompilerModel = {
			projectsBuildData: projects.map((p) => ({
				bundle: this.getBundle(p, args),
				project: p,
				files: []
			}))
		};

		compileModel = await pluginBasedPhase('init', compileModel, context);
		compileModel = await inputPhase(compileModel, context);
		compileModel = await pluginBasedPhase('link', compileModel, context);
		compileModel = await pluginBasedPhase('compile', compileModel, context);
		compileModel = await pluginBasedPhase('emit', compileModel, context);
	}

	private getBundle(project: Project, args: ParsedArguments): string {
		const bundles = Object.keys(project.resolvedConfig.build.bundles);
		let defaultBundle;
		for (const bundle of bundles) {
			if (args.map[bundle] === true) {
				return bundle;
			}
			if (project.resolvedConfig.build.bundles[bundle].default) {
				defaultBundle = bundle;
			}
		}

		if (defaultBundle) {
			return defaultBundle;
		} else if (bundles.length === 1) {
			return bundles[0];
		} else {
			throw new Error(
				`No bundle could be determined for project ${project} please define a default or state the bundle to be used with a CLI flag`
			);
		}
	}
}

export const compiler: Compiler = new Compiler();
