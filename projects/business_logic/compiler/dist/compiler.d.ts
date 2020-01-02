import { Project, ScriptContext } from '../../models';
import { VirtualFile } from '../../../libraries/file_system';
export interface InputPhaseOutput {
    projectsWithInput: ProjectWithInput[];
}
export interface ProjectWithInput {
    project: Project;
    files: VirtualFile[];
}
export declare class Compiler {
    compile(projects: Project[], context: ScriptContext): Promise<void>;
    private inputPhase;
}
export declare const compiler: Compiler;
//# sourceMappingURL=compiler.d.ts.map