"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_enhancer_1 = require("./logger_enhancer");
const log_level_1 = require("../log/log_level");
class LogLevelFilterLoggerEnhancer extends logger_enhancer_1.LoggerEnhancer {
    constructor(logLevel) {
        super();
        this.logLevel = logLevel;
    }
    enhance(log) {
        switch (this.logLevel) {
            case log_level_1.LogLevel.DEBUG:
                return log;
            case log_level_1.LogLevel.INFO:
                if (log.logLevel === log_level_1.LogLevel.DEBUG) {
                    return undefined;
                }
                else {
                    return log;
                }
            case log_level_1.LogLevel.WARN:
                if (log.logLevel === log_level_1.LogLevel.INFO || log.logLevel === log_level_1.LogLevel.DEBUG) {
                    return undefined;
                }
                else {
                    return log;
                }
            case log_level_1.LogLevel.ERROR:
                if (log.logLevel !== log_level_1.LogLevel.ERROR) {
                    return undefined;
                }
                else {
                    return log;
                }
        }
    }
}
exports.LogLevelFilterLoggerEnhancer = LogLevelFilterLoggerEnhancer;