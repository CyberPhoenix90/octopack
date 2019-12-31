import { FileSystem } from '../../../file_system';
import { Logger } from '../../../logger';
import { OctopackConfiguration } from '../../../config_resolver';
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
    abstract run(args: any, context: ScriptContext): Promise<ScriptStatus>;
}
//# sourceMappingURL=script.d.ts.map