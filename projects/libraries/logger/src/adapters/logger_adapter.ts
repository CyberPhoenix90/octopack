import { Log } from '../log/log';

export abstract class LoggerAdapter {
	protected abstract log(log: Log): void;
}
