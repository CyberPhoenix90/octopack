import { ScriptContext } from '../../../business_logic/models';
import { ParsedArguments } from '../../../libraries/argument_parser';
import { projectCrawler } from '../projects/project_crawler';
import { Help, Script, ScriptStatus } from './script';
import { loadGeneratorPlugin } from '../../../business_logic/plugin_loader';

export class Generate extends Script {
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
		for (const plugin of context.workspaceConfig.generator) {
			context.devLogger.debug(
				//@ts-ignore
				`Running generator plugin ${plugin?.name ?? plugin}`
			);
			await loadGeneratorPlugin(plugin)(projects, context);
		}

		return {};
	}
}
