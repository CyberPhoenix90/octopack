"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assert = require("assert");
const logger_1 = require("../src/logger");
const callback_logger_adapter_1 = require("../src/adapters/callback_logger_adapter");
const pass_through_logger_enhancer_1 = require("../src/enhancers/pass_through_logger_enhancer");
describe('Logger', () => {
    it('works', () => {
        let logged = false;
        const logger = new logger_1.Logger({
            adapters: [
                new callback_logger_adapter_1.CallbackLoggerAdapter(() => {
                    logged = true;
                })
            ],
            enhancers: [pass_through_logger_enhancer_1.PassThroughLoggerEnhancer]
        });
        assert(true);
    });
});
