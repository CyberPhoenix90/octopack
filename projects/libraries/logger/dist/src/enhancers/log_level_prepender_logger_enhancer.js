"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_enhancer_1 = require("./logger_enhancer");
class LogLevelPrependerLoggerEnhancer extends logger_enhancer_1.LoggerEnhancer {
    constructor() {
        super();
    }
    enhance(log) {
        log.text = `[${log.logLevel}]${log.text}`;
        return log;
    }
}
exports.LogLevelPrependerLoggerEnhancer = LogLevelPrependerLoggerEnhancer;