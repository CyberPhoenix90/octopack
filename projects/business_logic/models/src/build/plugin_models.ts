import { Project, ScriptContext } from '../projects/project';
import { VirtualFile } from '../../../../libraries/file_system';

export type OctoPackBuildPlugin = (model: ProjectBuildData, context: ScriptContext) => Promise<ProjectBuildData>;
export type OctoPackGeneratorPlugin = (projects: Project[], context: ScriptContext) => Promise<void>;

export interface CompilerModel {
	projectsBuildData: ProjectBuildData[];
}

export interface ProjectBuildData {
	project: Project;
	allProjects: Project[];
	bundle: string;
	files: VirtualFile[];
}
