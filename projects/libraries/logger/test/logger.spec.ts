import * as assert from 'assert';
import { Logger } from '../src/logger';
import { CallbackLoggerAdapter } from '../src/adapters/callback_logger_adapter';
import { PassThroughLoggerEnhancer } from '../src/enhancers/pass_through_logger_enhancer';
import { LogLevelPrependerLoggerEnhancer } from '../src/enhancers/log_level_prepender_logger_enhancer';
import { LogLevel } from '../src';

describe('Logger', () => {
	it('works', () => {
		let loggedText = '';
		const textToBeLogged = 'hey there';
		const logger = new Logger({
			adapters: [
				new CallbackLoggerAdapter((log) => {
					loggedText = log.text;
				})
			],
			enhancers: [PassThroughLoggerEnhancer]
		});

		logger.info(textToBeLogged);
		assert(loggedText === textToBeLogged);
	});

	it('has working log level prepender', () => {
		let loggedText = '';
		const textToBeLogged = 'hey there';
		const logger = new Logger({
			adapters: [
				new CallbackLoggerAdapter((log) => {
					loggedText = log.text;
				})
			],
			enhancers: [LogLevelPrependerLoggerEnhancer]
		});

		logger.info(textToBeLogged);
		assert(loggedText.includes(textToBeLogged) && loggedText.includes(LogLevel.INFO));
	});
});
