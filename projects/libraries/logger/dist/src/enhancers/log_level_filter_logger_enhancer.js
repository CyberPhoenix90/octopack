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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nX2xldmVsX2ZpbHRlcl9sb2dnZXJfZW5oYW5jZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dfbGV2ZWxfZmlsdGVyX2xvZ2dlcl9lbmhhbmNlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxPQUFPLEVBQUUsY0FBYyxFQUFlLE1BQU0sbUJBQW1CLENBQUM7QUFDaEUsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLGtCQUFrQixDQUFDO0FBRzVDLE1BQU0sT0FBTyw0QkFBNkIsU0FBUSxjQUFjO0lBRy9ELFlBQVksUUFBa0I7UUFDN0IsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBRU0sT0FBTyxDQUFDLEdBQVE7UUFDdEIsUUFBUSxJQUFJLENBQUMsUUFBUSxFQUFFO1lBQ3RCLEtBQUssUUFBUSxDQUFDLEtBQUs7Z0JBQ2xCLE9BQU8sR0FBRyxDQUFDO1lBQ1osS0FBSyxRQUFRLENBQUMsSUFBSTtnQkFDakIsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUU7b0JBQ3BDLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtxQkFBTTtvQkFDTixPQUFPLEdBQUcsQ0FBQztpQkFDWDtZQUNGLEtBQUssUUFBUSxDQUFDLElBQUk7Z0JBQ2pCLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxRQUFRLENBQUMsSUFBSSxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssUUFBUSxDQUFDLEtBQUssRUFBRTtvQkFDdEUsT0FBTyxTQUFTLENBQUM7aUJBQ2pCO3FCQUFNO29CQUNOLE9BQU8sR0FBRyxDQUFDO2lCQUNYO1lBQ0YsS0FBSyxRQUFRLENBQUMsS0FBSztnQkFDbEIsSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLFFBQVEsQ0FBQyxLQUFLLEVBQUU7b0JBQ3BDLE9BQU8sU0FBUyxDQUFDO2lCQUNqQjtxQkFBTTtvQkFDTixPQUFPLEdBQUcsQ0FBQztpQkFDWDtTQUNGO0lBQ0YsQ0FBQztDQUNEIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nX2xldmVsX2ZpbHRlcl9sb2dnZXJfZW5oYW5jZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJsb2dfbGV2ZWxfZmlsdGVyX2xvZ2dlcl9lbmhhbmNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVEQUFtRDtBQUNuRCxnREFBNEM7QUFDNUMsTUFBYSw0QkFBNkIsU0FBUSxnQ0FBYztJQUM1RCxZQUFZLFFBQVE7UUFDaEIsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUM3QixDQUFDO0lBQ0QsT0FBTyxDQUFDLEdBQUc7UUFDUCxRQUFRLElBQUksQ0FBQyxRQUFRLEVBQUU7WUFDbkIsS0FBSyxvQkFBUSxDQUFDLEtBQUs7Z0JBQ2YsT0FBTyxHQUFHLENBQUM7WUFDZixLQUFLLG9CQUFRLENBQUMsSUFBSTtnQkFDZCxJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssb0JBQVEsQ0FBQyxLQUFLLEVBQUU7b0JBQ2pDLE9BQU8sU0FBUyxDQUFDO2lCQUNwQjtxQkFDSTtvQkFDRCxPQUFPLEdBQUcsQ0FBQztpQkFDZDtZQUNMLEtBQUssb0JBQVEsQ0FBQyxJQUFJO2dCQUNkLElBQUksR0FBRyxDQUFDLFFBQVEsS0FBSyxvQkFBUSxDQUFDLElBQUksSUFBSSxHQUFHLENBQUMsUUFBUSxLQUFLLG9CQUFRLENBQUMsS0FBSyxFQUFFO29CQUNuRSxPQUFPLFNBQVMsQ0FBQztpQkFDcEI7cUJBQ0k7b0JBQ0QsT0FBTyxHQUFHLENBQUM7aUJBQ2Q7WUFDTCxLQUFLLG9CQUFRLENBQUMsS0FBSztnQkFDZixJQUFJLEdBQUcsQ0FBQyxRQUFRLEtBQUssb0JBQVEsQ0FBQyxLQUFLLEVBQUU7b0JBQ2pDLE9BQU8sU0FBUyxDQUFDO2lCQUNwQjtxQkFDSTtvQkFDRCxPQUFPLEdBQUcsQ0FBQztpQkFDZDtTQUNSO0lBQ0wsQ0FBQztDQUNKO0FBaENELG9FQWdDQztBQUNELHN3Q0FBc3dDIn0=