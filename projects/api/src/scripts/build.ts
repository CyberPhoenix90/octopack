import { projectCrawler } from '../projects/project_crawler';
import { Help, Script, ScriptContext, ScriptStatus } from './script';
import { npmInstallPlugin } from '../../../business_logic/plugins/npm_installer';
import { typescriptPlugin } from '../../../business_logic/plugins/typescript';
import { ParsedArguments } from '../../../libraries/argument_parser';

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
		const projects = await projectCrawler.findProjects(context.workspaceRoot, context.fileSystem);

		context.uiLogger.info(`Npm installing ${projects.length} projects...`);
		await npmInstallPlugin(projects);

		context.uiLogger.info(`Building ${projects.length} projects...`);
		await typescriptPlugin(projects);
		return {};
	}
}
