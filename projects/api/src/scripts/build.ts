import { ParsedArguments } from 'argument_parser';
import { compiler } from 'compiler';
import { ScriptContext } from 'models';
import { projectCrawler } from '../projects/project_crawler';
import { getSelectedProjects } from '../projects/project_selector';
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
		const selectedProjects = getSelectedProjects(args.list, allProjects, context);

		if (selectedProjects.length) {
			await compiler.compile(selectedProjects, allProjects, context, args);
		} else {
			context.uiLogger.error('None of the provided names were matching a project. Not building.');
		}

		return {};
	}
}
