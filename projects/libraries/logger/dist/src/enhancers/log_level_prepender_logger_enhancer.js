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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nX2xldmVsX3ByZXBlbmRlcl9sb2dnZXJfZW5oYW5jZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dfbGV2ZWxfcHJlcGVuZGVyX2xvZ2dlcl9lbmhhbmNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFnRTtBQUdoRSxNQUFhLCtCQUFnQyxTQUFRLGdDQUFjO0lBQ2xFO1FBQ0MsS0FBSyxFQUFFLENBQUM7SUFDVCxDQUFDO0lBRU0sT0FBTyxDQUFDLEdBQVE7UUFDdEIsR0FBRyxDQUFDLElBQUksR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLElBQUksR0FBRyxDQUFDLElBQUksRUFBRSxDQUFDO1FBQzFDLE9BQU8sR0FBRyxDQUFDO0lBQ1osQ0FBQztDQUNEO0FBVEQsMEVBU0MifQ==