import { Project, ScriptContext } from '../projects/project';
import { CachedFileSystem } from 'file_system';
import { MapLike } from '../../../../../typings/common';

export type OctoPackBuildPlugin = (model: ProjectBuildData, context: ScriptContext) => Promise<ProjectBuildData>;
export type OctoPackGeneratorPlugin = (projects: Project[], context: ScriptContext) => Promise<void>;

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
