"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_adapter_1 = require("./logger_adapter");
const log_level_1 = require("../log/log_level");
class ConsoleLoggerAdapter extends logger_adapter_1.LoggerAdapter {
    log(log) {
        const { object, logLevel, text } = log;
        let logInfo = [text];
        if (object) {
            logInfo.push(object);
        }
        switch (logLevel) {
            case log_level_1.LogLevel.INFO:
                console.info(logInfo);
                break;
            case log_level_1.LogLevel.DEBUG:
                console.debug(logInfo);
                break;
            case log_level_1.LogLevel.WARN:
                console.warn(logInfo);
                break;
            case log_level_1.LogLevel.ERROR:
                console.error(logInfo);
                break;
            default:
                throw new Error(`${logLevel} is not a known log level`);
        }
    }
}
exports.ConsoleLoggerAdapter = ConsoleLoggerAdapter;
//# sourceMappingURL=console_logger_adapter.js.map