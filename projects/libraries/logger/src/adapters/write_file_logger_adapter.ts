import { LoggerAdapter } from './logger_adapter';
import * as fs from 'fs';
import { Log } from '../log/log';
import { clearTimeout } from 'timers';

export class WriteFileLoggerAdapter extends LoggerAdapter {
	protected path: string;

	private timeOutId: NodeJS.Timeout;
	private bufferedLogLines: string[];

	constructor(path: string) {
		super();
		this.path = path;
		this.bufferedLogLines = [];
	}

	public log(log: Log): void {
		this.bufferedLogLines.push(this.createLogLine(log));

		if (this.timeOutId) {
			clearTimeout(this.timeOutId);
		}

		this.timeOutId = setTimeout(() => {
			fs.appendFile(this.path, this.bufferedLogLines.join(''), () => {});
			this.bufferedLogLines = [];
		}, 50);
	}

	private createLogLine(log: Log): string {
		return [log.text, JSON.stringify(log.object), '\n'].filter((s) => s).join('');
	}
}
