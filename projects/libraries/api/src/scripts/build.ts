import { Help, Script, ScriptContext, ScriptStatus } from './script';
import { projectCrawler } from '../projects/project_crawler';
import { spawn } from 'child_process';
import { Project } from '../projects/project';

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
		const promises: Promise<void>[] = [];
		for (const project of projects) {
			this.buildProject(project);
		}

		await Promise.all(promises);

		return {};
	}

	private buildProject(project: Project): Promise<void> {
		return new Promise((resolve, reject) => {
			const handle = spawn('tsc', {
				cwd: project.path
			});

			handle.on('error', (err) => {
				reject(err);
			});

			handle.on('close', () => {
				resolve();
			});

			handle.on('exit', () => {
				resolve();
			});
		});
	}
}
