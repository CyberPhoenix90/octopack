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
export declare function inputPhase(projects: ProjectWithBundle[], context: ScriptContext): Promise<InputPhaseOutput>;
//# sourceMappingURL=input.d.ts.map