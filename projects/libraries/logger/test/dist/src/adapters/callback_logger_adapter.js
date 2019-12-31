"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_adapter_1 = require("./logger_adapter");
class CallbackLoggerAdapter extends logger_adapter_1.LoggerAdapter {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    log(log) {
        this.callback();
    }
}
exports.CallbackLoggerAdapter = CallbackLoggerAdapter;
