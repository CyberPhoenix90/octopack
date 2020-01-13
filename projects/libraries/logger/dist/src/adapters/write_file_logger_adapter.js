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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVfZmlsZV9sb2dnZXJfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndyaXRlX2ZpbGVfbG9nZ2VyX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxFQUFFLGFBQWEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBQ2pELE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBRXpCLE9BQU8sRUFBRSxZQUFZLEVBQUUsTUFBTSxRQUFRLENBQUM7QUFFdEMsTUFBTSxPQUFPLHNCQUF1QixTQUFRLGFBQWE7SUFNeEQsWUFBWSxJQUFZO1FBQ3ZCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUM1QixDQUFDO0lBRU0sR0FBRyxDQUFDLEdBQVE7UUFDbEIsSUFBSSxDQUFDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7UUFFcEQsSUFBSSxJQUFJLENBQUMsU0FBUyxFQUFFO1lBQ25CLFlBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDN0I7UUFFRCxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDaEMsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUUsQ0FBQyxDQUFDLENBQUM7WUFDbkUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUM1QixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDUixDQUFDO0lBRU8sYUFBYSxDQUFDLEdBQVE7UUFDN0IsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7SUFDL0UsQ0FBQztDQUNEIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoid3JpdGVfZmlsZV9sb2dnZXJfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIndyaXRlX2ZpbGVfbG9nZ2VyX2FkYXB0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFDakQseUJBQXlCO0FBQ3pCLG1DQUFzQztBQUN0QyxNQUFhLHNCQUF1QixTQUFRLDhCQUFhO0lBQ3JELFlBQVksSUFBSTtRQUNaLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLElBQUksR0FBRyxJQUFJLENBQUM7UUFDakIsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztJQUMvQixDQUFDO0lBQ0QsR0FBRyxDQUFDLEdBQUc7UUFDSCxJQUFJLENBQUMsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQztRQUNwRCxJQUFJLElBQUksQ0FBQyxTQUFTLEVBQUU7WUFDaEIscUJBQVksQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUM7U0FDaEM7UUFDRCxJQUFJLENBQUMsU0FBUyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7WUFDN0IsRUFBRSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDcEUsSUFBSSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQztRQUMvQixDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDWCxDQUFDO0lBQ0QsYUFBYSxDQUFDLEdBQUc7UUFDYixPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNsRixDQUFDO0NBQ0o7QUFuQkQsd0RBbUJDO0FBQ0QsMDVDQUEwNUMifQ==