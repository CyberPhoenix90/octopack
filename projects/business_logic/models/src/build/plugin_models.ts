import { Project, ScriptContext } from '../projects/project';
import { VirtualFile } from 'file_system';
import { MapLike } from '../../../../../typings/common';

export type OctoPackBuildPlugin = (model: ProjectBuildData, context: ScriptContext) => Promise<ProjectBuildData>;
export type OctoPackGeneratorPlugin = (projects: Project[], context: ScriptContext) => Promise<void>;

export interface CompilerModel {
	projectsBuildData: ProjectBuildData[];
}

export interface ProjectBuildData {
	project: Project;
	selectedProjects: Project[];
	projectDependencies: Set<Project>;
	allProjects: Project[];
	bundle: string;
	files: VirtualFile[];
	outFiles: MapLike<VirtualFile>;
}
