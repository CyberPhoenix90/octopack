import { LogLevel } from './log_level';

export interface Log {
	text: string;
	object?: any;
	logLevel: LogLevel;
}
