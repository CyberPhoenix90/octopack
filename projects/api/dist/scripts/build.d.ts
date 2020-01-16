import { ScriptContext } from 'models';
import { ParsedArguments } from 'argument_parser';
import { Help, Script, ScriptStatus } from './script';
export declare class Build extends Script {
    autoComplete(): Promise<string[]>;
    help(): Help;
    run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus>;
    private getSelectedProjects;
}
//# sourceMappingURL=build.d.ts.map