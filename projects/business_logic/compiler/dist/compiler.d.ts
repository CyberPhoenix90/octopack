import { Project, ScriptContext } from '../../models';
import { ParsedArguments } from '../../../libraries/argument_parser';
export interface ProjectWithBundle {
    project: Project;
    bundle: string;
}
export declare class Compiler {
    compile(projects: Project[], context: ScriptContext, args: ParsedArguments): Promise<void>;
    private getBundle;
}
export declare const compiler: Compiler;
//# sourceMappingURL=compiler.d.ts.map