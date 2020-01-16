import * as ts from 'typescript';
import { ScriptContext, ProjectBuildData } from 'models';
export interface TypescriptCompilerConfig {
}
export declare function compile(model: ProjectBuildData, context: ScriptContext): Promise<ts.ExitStatus>;
//# sourceMappingURL=typescript_compiler.d.ts.map