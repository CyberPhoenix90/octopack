import { Help, Script, ScriptContext, ScriptStatus } from './script';
export declare class Build extends Script {
    autoComplete(): Promise<string[]>;
    help(): Help;
    run(args: any, context: ScriptContext): Promise<ScriptStatus>;
}
//# sourceMappingURL=build.d.ts.map