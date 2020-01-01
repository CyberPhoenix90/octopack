"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_adapter_1 = require("./logger_adapter");
const fs = require("fs");
const timers_1 = require("timers");
class WriteFileLoggerAdapter extends logger_adapter_1.LoggerAdapter {
    constructor(path) {
        super();
        this.path = path;
        this.bufferedLogLines = '';
    }
    log(log) {
        this.bufferedLogLines = this.bufferedLogLines + this.createLogLine(log);
        if (this.timeOutId) {
            timers_1.clearTimeout(this.timeOutId);
        }
        this.timeOutId = setTimeout(() => {
            fs.appendFile(this.path, this.bufferedLogLines, () => { });
            this.bufferedLogLines = '';
        }, 50);
    }
    createLogLine(log) {
        let logLine = log.text;
        if (log.object) {
            logLine = `${logLine}${JSON.stringify(log.object)}`;
        }
        logLine = logLine + '\n';
        return logLine;
    }
}
exports.WriteFileLoggerAdapter = WriteFileLoggerAdapter;
//# sourceMappingURL=write_file_logger_adapter.js.map