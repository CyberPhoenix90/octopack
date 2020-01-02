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
export declare function link(input: InputPhaseOutput, context: ScriptContext): Promise<LinkPhaseOutput>;
//# sourceMappingURL=link.d.ts.map