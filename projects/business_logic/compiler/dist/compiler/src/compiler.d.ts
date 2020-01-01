import { Project } from '../../models/src/projects/project';
import { MemoryFileSystemEntry } from '../../../libraries/file_system';
export interface InputPhaseOutput {
}
export interface ProjectInputPhase {
    project: Project;
    files: MemoryFileSystemEntry;
}
export declare class Compiler {
    compile(projects: Project[]): Promise<void>;
    private inputPhase;
}
export declare const compiler: Compiler;
//# sourceMappingURL=compiler.d.ts.map