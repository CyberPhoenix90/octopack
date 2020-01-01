import * as assert from 'assert';
import { Logger } from '../src/logger';
import { CallbackLoggerAdapter } from '../src/adapters/callback_logger_adapter';
import { PassThroughLoggerEnhancer } from '../src/enhancers/pass_through_logger_enhancer';
import { LogLevelPrependerLoggerEnhancer } from '../src/enhancers/log_level_prepender_logger_enhancer';
import { LogLevel, LogLevelFilterLoggerEnhancer } from '../src';

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
			enhancers: [new PassThroughLoggerEnhancer()]
		});

		logger.info(textToBeLogged);
		assert(loggedText === textToBeLogged);
	});

	describe('Log level prepender', () => {
		it('works with passed string', () => {
			let loggedText = '';
			const textToBeLogged = 'hey there';
			const logger = new Logger({
				adapters: [
					new CallbackLoggerAdapter((log) => {
						loggedText = log.text;
					})
				],
				enhancers: [new LogLevelPrependerLoggerEnhancer()]
			});

			logger.info(textToBeLogged);
			assert(loggedText.includes(textToBeLogged) && loggedText.includes(LogLevel.INFO));
		});

		it('works with passed object', () => {
			let loggedText: string;
			const logger = new Logger({
				adapters: [
					new CallbackLoggerAdapter((log) => {
						loggedText = log.text;
					})
				],
				enhancers: [new LogLevelPrependerLoggerEnhancer()]
			});

			logger.debug({ dummy: 'tada' });
			assert(loggedText.includes(LogLevel.DEBUG));
		});
	});

	describe('Log level filter', () => {
		it('works with debug level', () => {
			let loggedText = '';
			const textToBeLogged = 'hey there';

			const logger = new Logger({
				adapters: [
					new CallbackLoggerAdapter((log) => {
						loggedText = log.text;
					})
				],
				enhancers: [new LogLevelFilterLoggerEnhancer(LogLevel.DEBUG)]
			});

			logger.debug(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';

			logger.info(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';

			logger.warn(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';

			logger.error(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';
		});

		it('works with info level', () => {
			let loggedText = '';
			const textToBeLogged = 'hey there';

			const logger = new Logger({
				adapters: [
					new CallbackLoggerAdapter((log) => {
						loggedText = log.text;
					})
				],
				enhancers: [new LogLevelFilterLoggerEnhancer(LogLevel.INFO)]
			});

			logger.debug(textToBeLogged);
			assert(loggedText === '');
			loggedText = '';

			logger.info(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';

			logger.warn(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';

			logger.error(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';
		});

		it('works with warn level', () => {
			let loggedText = '';
			const textToBeLogged = 'hey there';

			const logger = new Logger({
				adapters: [
					new CallbackLoggerAdapter((log) => {
						loggedText = log.text;
					})
				],
				enhancers: [new LogLevelFilterLoggerEnhancer(LogLevel.WARN)]
			});

			logger.debug(textToBeLogged);
			assert(loggedText === '');
			loggedText = '';

			logger.info(textToBeLogged);
			assert(loggedText === '');
			loggedText = '';

			logger.warn(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';

			logger.error(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';
		});

		it('works with error level', () => {
			let loggedText = '';
			const textToBeLogged = 'hey there';

			const logger = new Logger({
				adapters: [
					new CallbackLoggerAdapter((log) => {
						loggedText = log.text;
					})
				],
				enhancers: [new LogLevelFilterLoggerEnhancer(LogLevel.ERROR)]
			});

			logger.debug(textToBeLogged);
			assert(loggedText === '');
			loggedText = '';

			logger.info(textToBeLogged);
			assert(loggedText === '');
			loggedText = '';

			logger.warn(textToBeLogged);
			assert(loggedText === '');
			loggedText = '';

			logger.error(textToBeLogged);
			assert(loggedText === textToBeLogged);
			loggedText = '';
		});
	});
});
