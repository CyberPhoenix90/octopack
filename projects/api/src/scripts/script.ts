import { FileSystem as FileSystemEntryData } from '../../../libraries/file_system';
import { Logger } from '../../../libraries/logger';
import { OctopackConfiguration } from '../../../business_logic/config_resolver';
import { ParsedArguments } from '../../../libraries/argument_parser';

export interface ScriptContext {
	workspaceConfig: OctopackConfiguration;
	uiLogger: Logger;
	devLogger: Logger;
	fileSystem: FileSystemEntryData;
	workspaceRoot: string;
}

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
