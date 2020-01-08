import { ScriptStatus } from '../../../api';
import { ParsedArguments } from '../../../libraries/argument_parser';
import { OctopackConfiguration } from '../../../business_logic/config_resolver';
export interface BuildRequestData {
    args: ParsedArguments;
    context: {
        workspaceConfig: OctopackConfiguration;
        fileSystem: unknown;
        workspaceRoot: string;
    };
}
export declare type BuildResponseData = ScriptStatus;
//# sourceMappingURL=build_data.d.ts.map