import { Project, ScriptContext } from '../projects/project';
import { CachedFileSystem } from 'projects/libraries/file_system/dist';

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
	fileSystem: CachedFileSystem;
	readonly input: string[];
	readonly output: string[];
}
