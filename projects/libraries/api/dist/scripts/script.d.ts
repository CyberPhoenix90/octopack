import { FileSystem } from '../../../file_system';
import { Logger } from '../../../logger';
import { OctopackConfiguration } from '../../../config_resolver';
import { ParsedArguments } from '../../../argument_parser';
export interface ScriptContext {
    workspaceConfig: OctopackConfiguration;
    uiLogger: Logger;
    devLogger: Logger;
    fileSystem: FileSystem;
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