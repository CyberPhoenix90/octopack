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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVfZmlsZV9sb2dnZXJfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndyaXRlX2ZpbGVfbG9nZ2VyX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFDakQseUJBQXlCO0FBRXpCLG1DQUFzQztBQUV0QyxNQUFhLHNCQUF1QixTQUFRLDhCQUFhO0lBTXhELFlBQVksSUFBWTtRQUN2QixLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxJQUFJLEdBQUcsSUFBSSxDQUFDO1FBQ2pCLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxFQUFFLENBQUM7SUFDNUIsQ0FBQztJQUVNLEdBQUcsQ0FBQyxHQUFRO1FBQ2xCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGFBQWEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO1FBRXBELElBQUksSUFBSSxDQUFDLFNBQVMsRUFBRTtZQUNuQixxQkFBWSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUM3QjtRQUVELElBQUksQ0FBQyxTQUFTLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtZQUNoQyxFQUFFLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxHQUFHLEVBQUUsR0FBRSxDQUFDLENBQUMsQ0FBQztZQUNuRSxJQUFJLENBQUMsZ0JBQWdCLEdBQUcsRUFBRSxDQUFDO1FBQzVCLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNSLENBQUM7SUFFTyxhQUFhLENBQUMsR0FBUTtRQUM3QixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUMvRSxDQUFDO0NBQ0Q7QUE1QkQsd0RBNEJDIn0=