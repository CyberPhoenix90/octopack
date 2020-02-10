"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_adapter_1 = require("./logger_adapter");
const fs = require("fs");
const timers_1 = require("timers");
class WriteFileLoggerAdapter extends logger_adapter_1.LoggerAdapter {
    constructor(path) {
        super();
        this.path = path;
        this.bufferedLogLines = [];
    }
    log(log) {
        this.bufferedLogLines.push(this.createLogLine(log));
        if (this.timeOutId) {
            timers_1.clearTimeout(this.timeOutId);
        }
        this.timeOutId = setTimeout(() => {
            fs.appendFile(this.path, this.bufferedLogLines.join(''), () => { });
            this.bufferedLogLines = [];
        }, 50);
    }
    createLogLine(log) {
        return [log.text, JSON.stringify(log.object), '\n'].filter((s) => s).join('');
    }
}
exports.WriteFileLoggerAdapter = WriteFileLoggerAdapter;