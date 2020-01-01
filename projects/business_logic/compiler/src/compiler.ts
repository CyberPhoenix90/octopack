import { Project, ScriptContext } from '../../models';
import { VirtualFile } from '../../../libraries/file_system';
import { inspect } from 'util';

export interface InputPhaseOutput {
	projectsWithInput: ProjectWithInput[];
}

export interface ProjectWithInput {
	project: Project;
	files: VirtualFile[];
}

export class Compiler {
	public async compile(projects: Project[], context: ScriptContext): Promise<void> {
		const projectsWithInput = await this.inputPhase(projects, context);

		console.log(inspect(projectsWithInput, false, 4));
	}

	private async inputPhase(projects: Project[], context: ScriptContext): Promise<InputPhaseOutput> {
		const inputPhaseResult: InputPhaseOutput = {
			projectsWithInput: []
		};

		for (const p of projects) {
			const entry: ProjectWithInput = {
				project: p,
				files: []
			};
			for (const pattern of p.resolvedConfig.build.bundles.dist.input) {
				const matches = await context.fileSystem.glob(p.path, pattern);
				entry.files.push(...(await Promise.all(matches.map((p) => context.fileSystem.toVirtualFile(p)))));
			}
			inputPhaseResult.projectsWithInput.push(entry);
		}

		return inputPhaseResult;
	}
}

export const compiler: Compiler = new Compiler();
