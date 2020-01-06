import { Logger } from '../../libraries/logger';

export interface ServerConfiguration {
	port?: number;
	loggingContexts?: { uiLogger?: Logger; devLogger?: Logger };
}
