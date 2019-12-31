import { LoggerConfiguration } from './logger_configuration';

export class Logger {
	private configuration: LoggerConfiguration;

	constructor(configuration: LoggerConfiguration) {
		this.configuration = configuration;
		console.log(this.configuration);
	}
}
