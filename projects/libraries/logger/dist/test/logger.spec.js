"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const src_1 = require("../src");
const callback_logger_adapter_1 = require("../src/adapters/callback_logger_adapter");
const log_level_prepender_logger_enhancer_1 = require("../src/enhancers/log_level_prepender_logger_enhancer");
const logger_1 = require("../src/logger");
describe('Logger', () => {
    it('works', () => {
        let loggedText = '';
        const textToBeLogged = 'hey there';
        const logger = new logger_1.Logger({
            adapters: [
                new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                    loggedText = log.text;
                })
            ],
            enhancers: []
        });
        logger.info(textToBeLogged);
        assert(loggedText === textToBeLogged);
    });
    it('falls back to pass through if no enhancer array is passed', () => {
        let loggedText = '';
        const textToBeLogged = 'hey there';
        const logger = new logger_1.Logger({
            adapters: [
                new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                    loggedText = log.text;
                })
            ]
        });
        logger.info(textToBeLogged);
        assert(loggedText === textToBeLogged);
    });
    describe('Log level prepender', () => {
        it('works with passed string', () => {
            let loggedText = '';
            const textToBeLogged = 'hey there';
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new log_level_prepender_logger_enhancer_1.LogLevelPrependerLoggerEnhancer()]
            });
            logger.info(textToBeLogged);
            assert(loggedText.includes(textToBeLogged) && loggedText.includes(src_1.LogLevel.INFO));
        });
        it('works with passed object', () => {
            let loggedText;
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new log_level_prepender_logger_enhancer_1.LogLevelPrependerLoggerEnhancer()]
            });
            logger.debug({ dummy: 'tada' });
            assert(loggedText.includes(src_1.LogLevel.DEBUG));
        });
    });
    describe('Log level filter', () => {
        it('works with debug level', () => {
            let loggedText = '';
            const textToBeLogged = 'hey there';
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new src_1.LogLevelFilterLoggerEnhancer(src_1.LogLevel.DEBUG)]
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
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new src_1.LogLevelFilterLoggerEnhancer(src_1.LogLevel.INFO)]
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
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new src_1.LogLevelFilterLoggerEnhancer(src_1.LogLevel.WARN)]
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
            const logger = new logger_1.Logger({
                adapters: [
                    new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                        loggedText = log.text;
                    })
                ],
                enhancers: [new src_1.LogLevelFilterLoggerEnhancer(src_1.LogLevel.ERROR)]
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
//# sourceMappingURL=logger.spec.js.map