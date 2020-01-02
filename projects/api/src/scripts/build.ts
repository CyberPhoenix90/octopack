import { projectCrawler } from '../projects/project_crawler';
import { Help, Script, ScriptStatus } from './script';
import { npmInstallPlugin } from '../../../business_logic/plugins/npm_installer';
import { typescriptPlugin } from '../../../business_logic/plugins/typescript';
import { ScriptContext, Project } from '../../../business_logic/models';
import { ParsedArguments } from '../../../libraries/argument_parser';
import { compiler } from '../../../business_logic/compiler';

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
		const selectedProjects = this.getSelectedProjects(
			args,
			await projectCrawler.findProjects(context.workspaceRoot, context),
			context
		);

		if (selectedProjects.length) {
			if (args.map.pipe) {
				await compiler.compile(selectedProjects, context, args);
			} else {
				context.uiLogger.info(`Npm installing ${selectedProjects.length} projects...`);
				await npmInstallPlugin(selectedProjects);

				context.uiLogger.info(`Building ${selectedProjects.length} projects...`);
				await typescriptPlugin(selectedProjects);
			}
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
