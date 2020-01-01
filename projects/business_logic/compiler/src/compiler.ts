import { Project } from '../../models/src/projects/project';

export class Compiler {
	public async compile(projects: Project[]): Promise<void> {}
}

export const compiler: Compiler = new Compiler();
