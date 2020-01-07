import * as WebSocket from 'ws';
import { Logger, /*ConsoleLoggerAdapter,*/ CallbackLoggerAdapter, Log, LogLevel } from 'logger';
import { Message } from './message_definitions/message';
import { MessageTypes } from './message_definitions/message_types';
import { MessageResponse } from './message_definitions/message_response';
import { ServerConfiguration } from './server_configuration';

export class Server {
	private server: WebSocket.Server;
	private port: number;

	private uiLogger: Logger;
	private devLogger: Logger;
	private logs: Log[];

	constructor(config: ServerConfiguration) {
		const { port = 8080, loggingContexts: loggingContext = { uiLogger: undefined, devLogger: undefined } } = config;

		if (port >= 1024 && port <= 49151) {
			this.port = port;
		} else {
			throw new Error(`${port} is not allowed to be used as a port. Aborting creation of server.`);
		}

		const {
			uiLogger = new Logger({ adapters: [], enhancers: [] }),
			devLogger = new Logger({ adapters: [], enhancers: [] })
		} = loggingContext;
		this.uiLogger = uiLogger;
		this.devLogger = devLogger;

		this.logs = [];
		this.devLogger.addAdapter(
			new CallbackLoggerAdapter((log) => {
				this.logs.push(log);
			})
		);
	}

	public initialize(): void {
		this.server = new WebSocket.Server({ port: this.port });

		this.server.on('connection', (socket) => {
			this.logForEveryContext('A client connected', LogLevel.INFO);

			socket.on('message', (message) => {
				if (typeof message === 'string') {
					const data = JSON.parse(message as string) as Message;
					if (data?.type !== undefined) {
						const response = this.processMessage(data);
						if (response) {
							socket.send(JSON.stringify(response));
						}
					} else {
						this.logForEveryContext(
							`Received message without defined type. It cannot be handled. Received message: ${message}`,
							LogLevel.ERROR
						);
					}
				} else {
					this.logForEveryContext(
						`Received message that wasn't a string. It cannot be handled. Received message: ${message}`,
						LogLevel.ERROR
					);
				}
			});

			socket.on('close', () => {
				this.logForEveryContext('A client disconnected', LogLevel.INFO);
			});
		});

		this.logForEveryContext('Server launched', LogLevel.INFO);
	}

	public close(): void {
		if (this.server) {
			this.server.close();
		}
	}

	private logForEveryContext(logData: any, logLevel: LogLevel): void {
		this.uiLogger.log(logData, logLevel);
		this.devLogger.log(logData, logLevel);
	}

	private processMessage(message: Message): MessageResponse | undefined {
		const { type } = message;
		switch (type) {
			case MessageTypes.LOGS_REQUEST:
				return { type: MessageTypes.LOGS_RESPONSE, data: this.logs };
		}

		this.logForEveryContext(
			`${type} does not have any handling. The server will not process this message.`,
			LogLevel.ERROR
		);
		return undefined;
	}
}

// const server = new Server({ loggingContexts: { uiLogger: new Logger({ adapters: [new ConsoleLoggerAdapter()] }) } });
// server.initialize();
