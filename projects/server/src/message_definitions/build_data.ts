import { ScriptStatus } from 'api';
import { ParsedArguments } from 'argument_parser';
import { OctopackConfiguration } from 'config_resolver';
import { FileSystem } from 'file_system';

export interface BuildRequestData {
	args: ParsedArguments;
	context: {
		workspaceConfig: OctopackConfiguration;
		fileSystem: FileSystem; // MapLike<VirtualFileSystemEntry>; is what should come here after running the script works on a virtual file system
		workspaceRoot: string;
	};
}

export type BuildResponseData = ScriptStatus;
