import { ParsedArguments } from 'argument_parser';
import { ScriptContext } from 'models';
import { Help, Script, ScriptStatus } from './script';
export declare class Run extends Script {
    autoComplete(): Promise<string[]>;
    help(): Help;
    run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus>;
}
//# sourceMappingURL=run.d.ts.map