import { Project } from '../projects/project';
import { VirtualFile } from '../../../../libraries/file_system/dist';

export type OctoPackBuildPlugin = (model: ProjectBuildData) => Promise<ProjectBuildData>;

export interface CompilerModel {
	projectsBuildData: ProjectBuildData[];
}

export interface ProjectBuildData {
	project: Project;
	bundle: string;
	files: VirtualFile[];
}
