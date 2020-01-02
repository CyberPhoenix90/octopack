import { Project, ScriptContext } from '../../../models';
import { VirtualFile } from '../../../../libraries/file_system';
import { ProjectWithBundle } from '../compiler';

export interface InputPhaseOutput {
	projectsWithInput: ProjectWithInput[];
}

export interface ProjectWithInput {
	project: Project;
	bundle: string;
	files: VirtualFile[];
}

export async function inputPhase(projects: ProjectWithBundle[], context: ScriptContext): Promise<InputPhaseOutput> {
	const inputPhaseResult: InputPhaseOutput = {
		projectsWithInput: []
	};

	for (const p of projects) {
		const entry: ProjectWithInput = {
			project: p.project,
			bundle: p.bundle,
			files: []
		};
		for (const pattern of p.project.resolvedConfig.build.bundles.dist.input) {
			const matches = await context.fileSystem.glob(p.project.path, pattern);
			entry.files.push(...(await Promise.all(matches.map((p) => context.fileSystem.toVirtualFile(p)))));
		}
		inputPhaseResult.projectsWithInput.push(entry);
	}

	return inputPhaseResult;
}
