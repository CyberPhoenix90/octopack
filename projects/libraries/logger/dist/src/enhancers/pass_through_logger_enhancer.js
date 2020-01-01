"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_enhancer_1 = require("./logger_enhancer");
class PassThroughLoggerEnhancer extends logger_enhancer_1.LoggerEnhancer {
    enhance(log) {
        return log;
    }
}
exports.PassThroughLoggerEnhancer = PassThroughLoggerEnhancer;
//# sourceMappingURL=pass_through_logger_enhancer.js.map