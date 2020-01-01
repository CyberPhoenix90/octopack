import { Help, Script, ScriptContext, ScriptStatus } from './script';
import { ParsedArguments } from '../../../libraries/argument_parser';
export declare class Build extends Script {
    autoComplete(): Promise<string[]>;
    help(): Help;
    run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus>;
}
//# sourceMappingURL=build.d.ts.map