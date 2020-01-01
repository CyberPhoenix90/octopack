import { ParsedArguments } from '../../../libraries/argument_parser';
import { ScriptContext } from '../../../business_logic/models';
export interface Help {
    description: string;
    arguments?: {
        [key: string]: string;
    };
}
export interface ScriptStatus {
    error?: Error;
    output?: string[];
}
export declare abstract class Script {
    abstract autoComplete(): Promise<string[]>;
    abstract help(): Help;
    abstract run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus>;
}
//# sourceMappingURL=script.d.ts.map