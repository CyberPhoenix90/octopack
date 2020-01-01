import { Log } from './log/log';
import { LogLevel } from './log/log_level';
import { LoggerConfiguration } from './logger_configuration';
import { PassThroughLoggerEnhancer } from './enhancers/pass_through_logger_enhancer';

export class Logger {
	private configuration: LoggerConfiguration;

	constructor(configuration: LoggerConfiguration) {
		this.configuration = configuration;
	}

	public info(logData: any): void {
		this.log(logData, LogLevel.INFO);
	}

	public debug(logData: any): void {
		this.log(logData, LogLevel.DEBUG);
	}

	public warn(logData: any): void {
		this.log(logData, LogLevel.WARN);
	}

	public error(logData: any): void {
		this.log(logData, LogLevel.ERROR);
	}

	public log(logData: any, logLevel: LogLevel): void {
		const { enhancers = [], adapters } = this.configuration;
		if (!adapters.length) {
			return;
		}

		if (!enhancers.length) {
			enhancers.push(new PassThroughLoggerEnhancer());
		}

		let log = this.createLog(logData, logLevel);

		for (const enhancer of enhancers) {
			log = enhancer.enhance(log);
			if (!log) {
				return;
			}
		}

		for (const adapter of adapters) {
			adapter.log(log);
		}
	}

	private createLog(logData: any, logLevel: LogLevel): Log {
		let text = '';
		let object: any;

		if (typeof logData === 'string') {
			text = logData;
		} else {
			object = logData;
		}

		return { logLevel, object, text };
	}
}
