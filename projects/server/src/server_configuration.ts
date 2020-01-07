import { Logger } from 'logger';

export interface ServerConfiguration {
	port?: number;
	loggingContexts?: { uiLogger?: Logger; devLogger?: Logger };
}
