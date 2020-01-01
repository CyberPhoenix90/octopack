import { projectCrawler } from '../projects/project_crawler';
import { Help, Script, ScriptContext, ScriptStatus } from './script';
import { npmInstallPlugin } from '../../../business_logic/plugins/npm_installer';
import { typescriptPlugin } from '../../../business_logic/plugins/typescript';

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
		console.log(`Building ${projects.length} projects...`);
		await npmInstallPlugin(projects);
		await typescriptPlugin(projects);
		return {};
	}
}
