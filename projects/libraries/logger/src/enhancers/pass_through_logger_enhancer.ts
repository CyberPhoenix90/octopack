import { LoggerEnhancer, EnhancedLog } from './logger_enhancer';
import { Log } from '../log/log';

export class PassThroughLoggerEnhancer extends LoggerEnhancer {
	public enhance(log: Log): EnhancedLog {
		return log;
	}
}
