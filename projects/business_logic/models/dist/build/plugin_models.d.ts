import { Project, ScriptContext } from '../projects/project';
import { CachedFileSystem } from 'file_system';
import { MapLike } from '../../../../../typings/common';
export declare type OctoPackBuildPlugin = (model: ProjectBuildData, context: ScriptContext) => Promise<ProjectBuildData>;
export declare type OctoPackGeneratorPlugin = (projects: Project[], context: ScriptContext) => Promise<void>;
export interface CompilerModel {
    projectsBuildData: ProjectBuildData[];
}
export interface ProjectBuildData {
    flags: MapLike<string>;
    project: Project;
    selectedProjects: Project[];
    allProjects: Project[];
    bundle: string;
    fileSystem: CachedFileSystem;
    readonly input: string[];
    readonly output: string[];
}
//# sourceMappingURL=plugin_models.d.ts.map