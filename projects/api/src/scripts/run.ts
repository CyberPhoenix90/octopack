import { ParsedArguments } from 'argument_parser';
import { ScriptContext } from 'models';
import { Help, Script, ScriptStatus } from './script';

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
		return {};
	}
}
