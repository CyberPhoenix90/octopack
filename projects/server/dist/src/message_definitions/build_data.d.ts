import { ScriptStatus } from '../../../api';
import { ParsedArguments } from '../../../libraries/argument_parser';
import { OctopackConfiguration } from '../../../business_logic/config_resolver';
import { FileSystem } from '../../../libraries/file_system';
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