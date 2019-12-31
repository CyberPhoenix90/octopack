import { Log } from '../log/log';
import { LoggerAdapter } from './logger_adapter';

export class CallbackLoggerAdapter extends LoggerAdapter {
	protected callback: (log: Log) => void;

	constructor(callback: (log: Log) => void) {
		super();
		this.callback = callback;
	}

	protected log(log: Log) {
		this.callback(log);
	}
}
