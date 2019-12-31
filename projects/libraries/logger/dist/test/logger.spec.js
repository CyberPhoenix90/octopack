"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const logger_1 = require("../src/logger");
const callback_logger_adapter_1 = require("../src/adapters/callback_logger_adapter");
const pass_through_logger_enhancer_1 = require("../src/enhancers/pass_through_logger_enhancer");
const log_level_prepender_logger_enhancer_1 = require("../src/enhancers/log_level_prepender_logger_enhancer");
const src_1 = require("../src");
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
            enhancers: [pass_through_logger_enhancer_1.PassThroughLoggerEnhancer]
        });
        logger.info(textToBeLogged);
        assert(loggedText === textToBeLogged);
    });
    it('has working log level prepender', () => {
        let loggedText = '';
        const textToBeLogged = 'hey there';
        const logger = new logger_1.Logger({
            adapters: [
                new callback_logger_adapter_1.CallbackLoggerAdapter((log) => {
                    loggedText = log.text;
                })
            ],
            enhancers: [log_level_prepender_logger_enhancer_1.LogLevelPrependerLoggerEnhancer]
        });
        logger.info(textToBeLogged);
        assert(loggedText.includes(textToBeLogged) && loggedText.includes(src_1.LogLevel.INFO));
    });
});
//# sourceMappingURL=logger.spec.js.map