import { Project, ScriptContext } from '../../models';
import { inspect } from 'util';
import { inputPhase } from './phases/input';
import { link } from './phases/link';
import { ParsedArguments } from '../../../libraries/argument_parser';

export interface ProjectWithBundle {
	project: Project;
	bundle: string;
}

export class Compiler {
	public async compile(projects: Project[], context: ScriptContext, args: ParsedArguments): Promise<void> {
		const projectsWithBundle = projects.map((p) => ({ bundle: this.getBundle(p, args), project: p }));

		const projectsWithInput = await inputPhase(projectsWithBundle, context);
		const linkedProjects = await link(projectsWithInput, context);

		console.log(inspect(linkedProjects, false, 4));
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
