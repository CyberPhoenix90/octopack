import { Log } from '../log/log';

export abstract class LoggerAdapter {
	public abstract log(log: Log): void;
}
