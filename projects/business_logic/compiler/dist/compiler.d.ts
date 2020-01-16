import { ParsedArguments } from 'argument_parser';
import { Project, ScriptContext } from 'models';
export declare class Compiler {
    compile(selectedProjects: Project[], allProjects: Project[], context: ScriptContext, args: ParsedArguments): Promise<void>;
    private sortByDependencies;
    private hasAll;
    private getBundle;
}
export declare const compiler: Compiler;
//# sourceMappingURL=compiler.d.ts.map