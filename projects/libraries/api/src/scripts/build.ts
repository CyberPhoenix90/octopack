import { Help, Script, ScriptContext, ScriptStatus } from './script';
import { projectCrawler } from '../projects/project_crawler';

export class Build extends Script {
	public autoComplete(): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	public help(): Help {
		return {
			description: 'Builds stuff'
		};
	}

	public async run(args: any, context: ScriptContext): Promise<ScriptStatus> {
		const projects = await projectCrawler.findProjects(context.workspaceRoot, context.fileSystem);
		console.log(projects);

		return {};
	}
}
