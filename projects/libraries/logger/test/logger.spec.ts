import * as assert from 'assert';
import { Logger } from '../src/logger';
import { CallbackLoggerAdapter } from '../src/adapters/callback_logger_adapter';
import { PassThroughLoggerEnhancer } from '../src/enhancers/pass_through_logger_enhancer';

describe('Logger', () => {
	it('works', () => {
		let logged = false;
		const logger = new Logger({
			adapters: [
				new CallbackLoggerAdapter(() => {
					logged = true;
				})
			],
			enhancers: [PassThroughLoggerEnhancer]
		});

		assert(true);
	});
});
