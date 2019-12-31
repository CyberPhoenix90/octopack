"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogLevelPrependerLoggerEnhancer = (log) => {
    log.text = `[${log.logLevel}] ${log.text}`;
    return log;
};
//# sourceMappingURL=log_level_prepender_logger_enhancer.js.map