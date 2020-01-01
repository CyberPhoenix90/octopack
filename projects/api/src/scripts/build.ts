import { projectCrawler } from '../projects/project_crawler';
import { Help, Script, ScriptStatus } from './script';
import { npmInstallPlugin } from '../../../business_logic/plugins/npm_installer';
import { typescriptPlugin } from '../../../business_logic/plugins/typescript';
import { ScriptContext } from '../../../business_logic/models';
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
		const projects = await projectCrawler.findProjects(context.workspaceRoot, context);

		if (args.map.pipe) {
			await compiler.compile(projects, context);
		} else {
			context.uiLogger.info(`Npm installing ${projects.length} projects...`);
			await npmInstallPlugin(projects);

			context.uiLogger.info(`Building ${projects.length} projects...`);
			await typescriptPlugin(projects);
		}

		return {};
	}
}
