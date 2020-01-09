"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_enhancer_1 = require("./logger_enhancer");
const log_level_1 = require("../log/log_level");
class LogLevelFilterLoggerEnhancer extends logger_enhancer_1.LoggerEnhancer {
    constructor(logLevel) {
        super();
        this.logLevel = logLevel;
    }
    enhance(log) {
        switch (this.logLevel) {
            case log_level_1.LogLevel.DEBUG:
                return log;
            case log_level_1.LogLevel.INFO:
                if (log.logLevel === log_level_1.LogLevel.DEBUG) {
                    return undefined;
                }
                else {
                    return log;
                }
            case log_level_1.LogLevel.WARN:
                if (log.logLevel === log_level_1.LogLevel.INFO || log.logLevel === log_level_1.LogLevel.DEBUG) {
                    return undefined;
                }
                else {
                    return log;
                }
            case log_level_1.LogLevel.ERROR:
                if (log.logLevel !== log_level_1.LogLevel.ERROR) {
                    return undefined;
                }
                else {
                    return log;
                }
        }
    }
}
exports.LogLevelFilterLoggerEnhancer = LogLevelFilterLoggerEnhancer;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nX2xldmVsX2ZpbHRlcl9sb2dnZXJfZW5oYW5jZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dfbGV2ZWxfZmlsdGVyX2xvZ2dlcl9lbmhhbmNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFnRTtBQUNoRSxnREFBNEM7QUFHNUMsTUFBYSw0QkFBNkIsU0FBUSxnQ0FBYztJQUcvRCxZQUFZLFFBQWtCO1FBQzdCLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7SUFDMUIsQ0FBQztJQUVNLE9BQU8sQ0FBQyxHQUFRO1FBQ3RCLFFBQVEsSUFBSSxDQUFDLFFBQVEsRUFBRTtZQUN0QixLQUFLLG9CQUFRLENBQUMsS0FBSztnQkFDbEIsT0FBTyxHQUFHLENBQUM7WUFDWixLQUFLLG9CQUFRLENBQUMsSUFBSTtnQkFDakIsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLG9CQUFRLENBQUMsS0FBSyxFQUFFO29CQUNwQyxPQUFPLFNBQVMsQ0FBQztpQkFDakI7cUJBQU07b0JBQ04sT0FBTyxHQUFHLENBQUM7aUJBQ1g7WUFDRixLQUFLLG9CQUFRLENBQUMsSUFBSTtnQkFDakIsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLG9CQUFRLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssb0JBQVEsQ0FBQyxLQUFLLEVBQUU7b0JBQ3RFLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtxQkFBTTtvQkFDTixPQUFPLEdBQUcsQ0FBQztpQkFDWDtZQUNGLEtBQUssb0JBQVEsQ0FBQyxLQUFLO2dCQUNsQixJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssb0JBQVEsQ0FBQyxLQUFLLEVBQUU7b0JBQ3BDLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtxQkFBTTtvQkFDTixPQUFPLEdBQUcsQ0FBQztpQkFDWDtTQUNGO0lBQ0YsQ0FBQztDQUNEO0FBaENELG9FQWdDQyJ9