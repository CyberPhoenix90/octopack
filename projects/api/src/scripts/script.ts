import { ParsedArguments } from '../../../libraries/argument_parser';
import { ScriptContext } from '../../../business_logic/models';

export interface Help {
	description: string;
	arguments?: { [key: string]: string };
}

export interface ScriptStatus {
	error?: Error;
	output?: string[];
}

export abstract class Script {
	public abstract autoComplete(): Promise<string[]>;
	public abstract help(): Help;
	public abstract run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus>;
}
