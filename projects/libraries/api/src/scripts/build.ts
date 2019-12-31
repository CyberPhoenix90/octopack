import { Help, Script, ScriptContext, ScriptStatus } from './script';

export class Build extends Script {
	public autoComplete(): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	public help(): Help {
		return {
			description: 'Builds stuff'
		};
	}

	public async run(args: any, context: ScriptContext): Promise<ScriptStatus> {
		console.log(args);
		return {};
	}
}
