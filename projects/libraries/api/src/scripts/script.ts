import { FileSystem } from '../../../file_system';
import { Logger } from '../../../logger';
import { OctopackConfiguration } from '../../../config_resolver';

export interface ScriptContext {
    workspaceConfig:OctopackConfiguration;
    uiLogger:Logger;
    devLogger:Logger;
    fileSystem:FileSystem;
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
	public abstract run(args: any, context:ScriptContext): Promise<ScriptStatus>;
}
