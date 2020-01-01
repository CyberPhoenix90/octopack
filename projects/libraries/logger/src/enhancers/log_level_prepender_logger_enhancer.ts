import { LoggerEnhancer, EnhancedLog } from './logger_enhancer';
import { Log } from '../log/log';

export class LogLevelPrependerLoggerEnhancer extends LoggerEnhancer {
	constructor() {
		super();
	}

	public enhance(log: Log): EnhancedLog {
		log.text = `[${log.logLevel}] ${log.text}`;
		return log;
	}
}
