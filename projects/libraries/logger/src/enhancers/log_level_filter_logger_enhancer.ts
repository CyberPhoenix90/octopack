import { LoggerEnhancer, EnhancedLog } from './logger_enhancer';
import { LogLevel } from '../log/log_level';
import { Log } from '../log/log';

export class LogLevelFilterLoggerEnhancer extends LoggerEnhancer {
	protected logLevel: LogLevel;

	constructor(logLevel: LogLevel) {
		super();
		this.logLevel = logLevel;
	}

	public enhance(log: Log): EnhancedLog {
		switch (this.logLevel) {
			case LogLevel.DEBUG:
				return log;
			case LogLevel.INFO:
				if (log.logLevel === LogLevel.DEBUG) {
					return undefined;
				} else {
					return log;
				}
			case LogLevel.WARN:
				if (log.logLevel === LogLevel.INFO || log.logLevel === LogLevel.DEBUG) {
					return undefined;
				} else {
					return log;
				}
			case LogLevel.ERROR:
				if (log.logLevel !== LogLevel.ERROR) {
					return undefined;
				} else {
					return log;
				}
		}
	}
}
