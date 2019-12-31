import { LoggerAdapter } from './logger_adapter';
import { Log } from '../log/log';
import { LogLevel } from '../log/log_level';

export class ConsoleLoggerAdapter extends LoggerAdapter {
	public log(log: Log): void {
		const { object, logLevel, text } = log;

		let logInfo = [text];
		if (object) {
			logInfo.push(object);
		}

		switch (logLevel) {
			case LogLevel.INFO:
				console.info(logInfo);
				break;
			case LogLevel.DEBUG:
				console.debug(logInfo);
				break;
			case LogLevel.WARN:
				console.warn(logInfo);
				break;
			case LogLevel.ERROR:
				console.error(logInfo);
				break;
			default:
				throw new Error(`${logLevel} is not a known log level`);
		}
	}
}
