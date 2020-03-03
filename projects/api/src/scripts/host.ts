import { ParsedArguments } from 'argument_parser';
import { ScriptContext } from 'models';
import { Help, Script, ScriptStatus } from './script';
import { WebServer } from 'webserver';
import { join } from 'path';

export class Host extends Script {
	public autoComplete(): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	public help(): Help {
		return {
			description: 'Hosts stuff'
		};
	}

	public async run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus> {
		const ws = new WebServer({
			port: 8080
		});

		ws.addEndpoint('*', '**', async (req, res, next) => {
			const path = join(context.workspaceRoot, req.url.substring(1));

			await this.submitFile(context, path, res);
		});
		ws.listen();

		return {};
	}

	private async submitFile(context: ScriptContext, path: string, res: import('http').ServerResponse) {
		if (await context.fileSystem.exists(path)) {
			const content = await context.fileSystem.readFile(path, 'utf8');
			res.writeHead(200, { 'Content-Type': this.getMimeType(path.substring(path.indexOf('.') + 1)) });
			res.write(content);
			res.end();
		} else {
			res.writeHead(404, { 'Content-Type': 'text/plain' });
			res.write(`Not found: ${path}`);
			res.end();
		}
	}

	private getMimeType(extension: string): string {
		switch (extension) {
			case 'html':
				return 'text/html';
			case 'js':
				return 'text/javascript';
			case 'css':
				return 'text/css';
			case 'woff2':
				return 'font/woff2';
			default:
				return 'text/plain';
		}
	}
}
