import { ScriptStatus } from 'api';
import { ParsedArguments } from 'argument_parser';
import { OctopackConfiguration } from 'config_resolver';
import { FileSystem } from 'file_system';
export interface BuildRequestData {
    args: ParsedArguments;
    context: {
        workspaceConfig: OctopackConfiguration;
        fileSystem: FileSystem;
        workspaceRoot: string;
    };
}
export declare type BuildResponseData = ScriptStatus;
//# sourceMappingURL=build_data.d.ts.map