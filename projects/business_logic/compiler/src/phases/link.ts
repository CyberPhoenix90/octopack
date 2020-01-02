import { InputPhaseOutput } from './input';
import { Project, ScriptContext } from '../../../models';
import { VirtualFile } from '../../../../libraries/file_system';

export interface LinkPhaseOutput {
	projectsWithLinks: ProjectWithLinks[];
}

export interface ProjectWithLinks {
	project: Project;
	bundle: string;
	files: VirtualFile[];
}

export async function link(input: InputPhaseOutput, context: ScriptContext): Promise<LinkPhaseOutput> {
	for (const projectWithInput of input.projectsWithInput) {
		console.log(projectWithInput.project.resolvedConfig.build.bundles[projectWithInput.bundle].compilation.link);
	}
	throw new Error('not implemented');
}
