import { ScriptStatus } from 'api';
import { ParsedArguments } from 'argument_parser';
import { OctopackConfiguration } from 'config_resolver';

export interface BuildRequestData {
	args: ParsedArguments;
	context: {
		workspaceConfig: OctopackConfiguration;
		fileSystem: unknown;
		workspaceRoot: string;
	};
}

export type BuildResponseData = ScriptStatus;
