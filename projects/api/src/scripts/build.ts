import { compiler } from 'compiler';
import { Project, ScriptContext } from 'models';
import { ParsedArguments } from 'argument_parser';
import { projectCrawler } from '../projects/project_crawler';
import { Help, Script, ScriptStatus } from './script';

export class Build extends Script {
	public autoComplete(): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	public help(): Help {
		return {
			description: 'Builds stuff'
		};
	}

	public async run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus> {
		const allProjects = await projectCrawler.findProjects(context.workspaceRoot, context);
		const selectedProjects = this.getSelectedProjects(args, allProjects, context);

		if (selectedProjects.length) {
			await compiler.compile(selectedProjects, allProjects, context, args);
		} else {
			context.uiLogger.error('None of the provided names were matching a project. Not building.');
		}

		return {};
	}

	private getSelectedProjects(args: ParsedArguments, projects: Project[], context: ScriptContext): Project[] {
		if (!args.list.length) {
			return projects;
		} else {
			const selectedProjects: Project[] = [];

			projects.forEach((p) => {
				if (args.list.includes(p.resolvedConfig.name)) {
					selectedProjects.push(p);
				}
			});

			if (selectedProjects.length < args.list.length) {
				const notFoundNames: string[] = [];
				const selectedProjectNames = selectedProjects.map((p) => p.resolvedConfig.name);

				args.list.forEach((a) => {
					if (!selectedProjectNames.includes(a)) {
						notFoundNames.push(a);
					}
				});

				context.uiLogger.warn(
					`No project(s) with the name(s) ${notFoundNames.join(
						', '
					)} could be located. Skipping these arguments.`
				);
			}
			return selectedProjects;
		}
	}
}
