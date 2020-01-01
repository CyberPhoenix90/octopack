"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_adapter_1 = require("./logger_adapter");
const fs = require("fs");
class WriteFileLoggerAdapter extends logger_adapter_1.LoggerAdapter {
    constructor(path) {
        super();
        this.path = path;
    }
    log(log) {
        let logData = log.text;
        if (log.object) {
            logData = `${logData}${JSON.stringify(log.object)}`;
        }
        fs.appendFile(this.path, logData, (error) => {
            if (error) {
                throw error;
            }
        });
    }
}
exports.WriteFileLoggerAdapter = WriteFileLoggerAdapter;
//# sourceMappingURL=write_file_logger_adapter.js.map