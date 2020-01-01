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
    arguments?: {
        [key: string]: string;
    };
}
export interface ScriptStatus {
    error?: Error;
    output?: string[];
}
export declare abstract class Script {
    abstract autoComplete(): Promise<string[]>;
    abstract help(): Help;
    abstract run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus>;
}
//# sourceMappingURL=script.d.ts.map