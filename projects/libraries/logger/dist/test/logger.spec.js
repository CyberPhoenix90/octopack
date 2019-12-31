"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const logger_1 = require("../src/logger");
const callback_logger_adapter_1 = require("../src/adapters/callback_logger_adapter");
const pass_through_logger_enhancer_1 = require("../src/enhancers/pass_through_logger_enhancer");
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
});
//# sourceMappingURL=logger.spec.js.map