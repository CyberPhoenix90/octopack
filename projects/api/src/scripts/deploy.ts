import { ParsedArguments } from 'argument_parser';
import { ScriptContext } from 'models';
import { projectCrawler } from '../projects/project_crawler';
import { Help, Script, ScriptStatus } from './script';
import { getSelectedProjects } from '../projects/project_selector';
import { Build } from './build';
import { getBundle } from 'config_resolver';
import { join } from 'path';

export class Deploy extends Script {
	public autoComplete(): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	public help(): Help {
		return {
			description: 'Deploys stuff'
		};
	}

	public async run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus> {
		const allProjects = await projectCrawler.findProjects(context.workspaceRoot, context);
		const selectedProjects = getSelectedProjects(args.list, allProjects, context).filter(
			(p) => p.resolvedConfig.deploy
		);

		if (selectedProjects.length) {
			await new Build().run(
				{
					list: selectedProjects.map((p) => p.resolvedConfig.name),
					map: {
						remapImportSource: './internalDependencies',
						...args.map
					},
					raw: args.raw
				},
				context
			);
			for (const project of selectedProjects) {
				const bundle = getBundle(project.resolvedConfig, args.map as any);
				if (!bundle) {
					throw new Error(
						`No bundle could be determined for project ${project} please define a default or state the bundle to be used with a CLI flag`
					);
				}

				const config = project.resolvedConfig.build.bundles[bundle];
				const outDir = join(project.path, config.output);
				context.fileSystem.copyDirectory(outDir, join(project.path, 'internalDependencies'));
			}
		} else {
			context.uiLogger.error('None of the provided names were matching a project. Not building.');
		}

		return {};
	}
}
