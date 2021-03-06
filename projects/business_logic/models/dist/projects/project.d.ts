import { OctopackConfiguration } from 'config_resolver';
import { FileSystem } from 'file_system';
import { Logger } from 'logger';
export interface Project {
    path: string;
    projectDependencies: Set<Project>;
    fileDependencies: Map<string, string>;
    virtualFileImports: Map<string, string>;
    rawConfig: OctopackConfiguration;
    resolvedConfig: OctopackConfiguration;
}
export interface ScriptContext {
    workspaceConfig: OctopackConfiguration;
    uiLogger: Logger;
    devLogger: Logger;
    fileSystem: FileSystem;
    workspaceRoot: string;
}
//# sourceMappingURL=project.d.ts.map