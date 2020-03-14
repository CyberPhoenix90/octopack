import { ParsedArguments } from 'argument_parser';
import { ScriptContext } from 'models';
import { Help, Script, ScriptStatus } from './script';
import { projectCrawler } from '../projects/project_crawler';
import { getSelectedProjects } from '../projects/project_selector';
import { spawn } from 'child_process';

export class Run extends Script {
	public autoComplete(): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	public help(): Help {
		return {
			description: 'Runs stuff'
		};
	}

	public async run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus> {
		const allProjects = await projectCrawler.findProjects(context.workspaceRoot, context);
		const selectedProjects = getSelectedProjects(args.list, allProjects, context);
		const nodeArgs = [];
		if (args.map.debug || args.map.d) {
			nodeArgs.push('--inspect-brk');
		}
		for (const project of selectedProjects) {
			spawn('node', [...nodeArgs, '.'], {
				stdio: 'inherit',
				cwd: project.path
			});
		}

		return {};
	}
}
