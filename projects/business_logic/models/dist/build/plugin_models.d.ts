import { FileSystem } from 'file_system';
import { Project, ScriptContext } from '../projects/project';
export declare type OctoPackBuildPlugin = (model: ProjectBuildData, context: ScriptContext) => Promise<ProjectBuildData>;
export declare type OctoPackGeneratorPlugin = (projects: Project[], context: ScriptContext) => Promise<void>;
export interface CompilerModel {
    projectsBuildData: ProjectBuildData[];
}
export interface ProjectBuildData {
    project: Project;
    selectedProjects: Project[];
    projectDependencies: Set<Project>;
    allProjects: Project[];
    bundle: string;
    input: string[];
    output: FileSystem;
}
//# sourceMappingURL=plugin_models.d.ts.map