import { Log } from './log/log';
import { LogLevel } from './log/log_level';
import { LoggerConfiguration } from './logger_configuration';
import { LoggerAdapter } from './adapters/logger_adapter';

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

	public addAdapter(adapter: LoggerAdapter): void {
		this.configuration.adapters.push(adapter);
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
