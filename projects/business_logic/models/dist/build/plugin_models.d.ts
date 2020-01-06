import { Project, ScriptContext } from '../projects/project';
import { VirtualFile } from '../../../../libraries/file_system';
export declare type OctoPackBuildPlugin = (model: ProjectBuildData, context: ScriptContext) => Promise<ProjectBuildData>;
export interface CompilerModel {
    projectsBuildData: ProjectBuildData[];
}
export interface ProjectBuildData {
    project: Project;
    bundle: string;
    files: VirtualFile[];
}
//# sourceMappingURL=plugin_models.d.ts.map