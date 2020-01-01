import { LoggerAdapter } from './logger_adapter';
import * as fs from 'fs';
import { Log } from '../log/log';

export class WriteFileLoggerAdapter extends LoggerAdapter {
	protected path: string;

	constructor(path: string) {
		super();
		this.path = path;
	}

	public log(log: Log): void {
		let logData = log.text;
		if (log.object) {
			logData = `${logData}${JSON.stringify(log.object)}`;
		}

		fs.appendFile(this.path, logData + '\n', (error) => {
			if (error) {
				throw error;
			}
		});
	}
}
