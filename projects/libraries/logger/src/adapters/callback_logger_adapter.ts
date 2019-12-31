import { Log } from '../log/log';
import { LoggerAdapter } from './logger_adapter';

export class CallbackLoggerAdapter extends LoggerAdapter {
	protected callback: (...args: any[]) => void;

	constructor(callback: (...args: any[]) => void) {
		super();
		this.callback = callback;
	}

	protected log(log: Log) {
		this.callback();
	}
}
