import { Log } from '../log/log';

export type EnhancedLog = Log | undefined;

export abstract class LoggerEnhancer {
	public abstract enhance(log: Log): EnhancedLog;
}
