import { ScriptContext } from '../../../business_logic/models';
import { ParsedArguments } from '../../../libraries/argument_parser';
import { Help, Script, ScriptStatus } from './script';
export declare class Generate extends Script {
    autoComplete(): Promise<string[]>;
    help(): Help;
    run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus>;
}
//# sourceMappingURL=generate.d.ts.map