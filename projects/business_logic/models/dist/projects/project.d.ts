import { OctopackConfiguration } from '../../../config_resolver';
import { FileSystem } from '../../../../libraries/file_system';
import { Logger } from '../../../../libraries/logger';
export interface Project {
    path: string;
    rawConfig: OctopackConfiguration;
    resoledConfig: OctopackConfiguration;
}
export interface ScriptContext {
    workspaceConfig: OctopackConfiguration;
    uiLogger: Logger;
    devLogger: Logger;
    fileSystem: FileSystem;
    workspaceRoot: string;
}
//# sourceMappingURL=project.d.ts.map