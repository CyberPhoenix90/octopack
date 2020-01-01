"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_level_1 = require("./log/log_level");
class Logger {
    constructor(configuration) {
        this.configuration = configuration;
    }
    info(logData) {
        this.log(logData, log_level_1.LogLevel.INFO);
    }
    debug(logData) {
        this.log(logData, log_level_1.LogLevel.DEBUG);
    }
    warn(logData) {
        this.log(logData, log_level_1.LogLevel.WARN);
    }
    error(logData) {
        this.log(logData, log_level_1.LogLevel.ERROR);
    }
    log(logData, logLevel) {
        const { enhancers, adapters } = this.configuration;
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
    createLog(logData, logLevel) {
        let text = '';
        let object;
        if (typeof logData === 'string') {
            text = logData;
        }
        else {
            object = logData;
        }
        return { logLevel, object, text };
    }
}
exports.Logger = Logger;
//# sourceMappingURL=logger.js.map