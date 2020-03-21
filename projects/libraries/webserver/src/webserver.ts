import * as http from 'http';
import * as minimatch from 'minimatch';
import { MapLike } from '../../../../typings/common';

export enum HTTPVerb {
	POST = 'POST',
	GET = 'GET',
	PUT = 'PUT',
	DELETE = 'DELETE',
	HEAD = 'HEAD',
	OPTIONS = 'OPTIONS'
}

export interface WebServerConfig {
	port: number;
	ip?: string;
}

export interface HttpRequest {
	url: string;
	query?: string;
	body: Buffer;
	method: HTTPVerb;
}

export type ServerErrorHandler = (
	error: Error,
	req: HttpRequest,
	res: http.ServerResponse,
	next: () => void
) => void | Promise<void>;

export type MessageHandler = (req: HttpRequest, res: http.ServerResponse, next: () => void) => void | Promise<void>;

export class WebServer {
	private config: WebServerConfig;
	private server: http.Server;
	private endpoints: MapLike<{ method: HTTPVerb | '*'; handler: MessageHandler }>;
	private notFoundHandlers: MessageHandler[];
	private serverErrorHandlers: ServerErrorHandler[];

	constructor(config: WebServerConfig) {
		this.config = config;
		this.endpoints = {};
		this.notFoundHandlers = [];
		this.serverErrorHandlers = [];
	}

	public addEndpoint(method: HTTPVerb | '*', urlPattern: string, handler: MessageHandler) {
		this.endpoints[urlPattern] = {
			handler,
			method
		};
	}

	public addNotFoundHandler(handler: MessageHandler) {
		this.notFoundHandlers.push(handler);
	}

	public addServerErrorHandler(
		handler: (error: Error, req: HttpRequest, res: http.ServerResponse, next: () => void) => void | Promise<void>
	) {
		this.serverErrorHandlers.push(handler);
	}

	public listen(): Promise<void> {
		this.server = new http.Server((req, res) => this.onMessage(req, res));
		return new Promise((resolve, reject) => {
			try {
				this.server.listen(this.config.port, this.config.ip ?? '0.0.0.0', () => {
					resolve();
				});
			} catch (e) {
				reject(e);
			}
		});
	}

	private getMessageHandlers(url: string, verb: HTTPVerb): MessageHandler[] {
		const handlers: { score: number; handler: MessageHandler }[] = [];
		for (const endpoint of Object.keys(this.endpoints)) {
			if (minimatch(url, endpoint)) {
				if (this.endpoints[endpoint].method === verb || this.endpoints[endpoint].method === '*') {
					handlers.push({ score: endpoint.length, handler: this.endpoints[endpoint].handler });
				}
			}
		}

		return handlers.sort((a, b) => b.score - a.score).map((p) => p.handler);
	}

	private onMessage(req: http.IncomingMessage, res: http.ServerResponse) {
		const chunks: Buffer[] = [];
		req.on('data', (chunk) => {
			chunks.push(chunk);
		});

		req.on('end', async () => {
			const data = Buffer.concat(chunks);
			const wrappedRequest: HttpRequest = {
				body: data,
				url: req.url.split('?')[0],
				query: req.url.split('?')[1],
				method: (req.method as any) as HTTPVerb
			};
			try {
				for (const handler of this.getMessageHandlers(req.url, (req.method as any) as HTTPVerb)) {
					let cont = false;
					await handler(wrappedRequest, res, () => {
						cont = true;
					});
					if (!cont) {
						return;
					}
				}
				try {
					for (const handler of this.notFoundHandlers) {
						let cont = false;
						await handler(wrappedRequest, res, () => {
							cont = true;
						});
						if (!cont) {
							return;
						}
					}
					res.statusCode = 404;
					res.statusMessage = `Not Found`;
					res.write('Error 404 Not found');
					res.end();
				} catch (e2) {
					res.statusCode = 500;
					res.statusMessage = `Server error ${e2} occured while trying to deliver not found page`;
					res.end();
				}
			} catch (e) {
				try {
					for (const handler of this.serverErrorHandlers) {
						let cont = false;
						await handler(e, wrappedRequest, res, () => {
							cont = true;
						});
						if (!cont) {
							return;
						}
					}
				} catch (e2) {
					res.statusCode = 500;
					res.statusMessage = `Server error ${e2} occured while trying to handle server error ${e}`;
					res.end();
				}
			}
		});
	}
}

export function getMimeType(extension: string): string {
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
