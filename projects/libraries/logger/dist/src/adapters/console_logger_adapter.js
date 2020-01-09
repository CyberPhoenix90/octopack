"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_adapter_1 = require("./logger_adapter");
const log_level_1 = require("../log/log_level");
class ConsoleLoggerAdapter extends logger_adapter_1.LoggerAdapter {
    log(log) {
        const { object, logLevel, text } = log;
        let logInfo = [text];
        if (object) {
            logInfo.push(object);
        }
        switch (logLevel) {
            case log_level_1.LogLevel.INFO:
                console.info(...logInfo);
                break;
            case log_level_1.LogLevel.DEBUG:
                console.debug(...logInfo);
                break;
            case log_level_1.LogLevel.WARN:
                console.warn(...logInfo);
                break;
            case log_level_1.LogLevel.ERROR:
                console.error(...logInfo);
                break;
            default:
                throw new Error(`${logLevel} is not a known log level`);
        }
    }
}
exports.ConsoleLoggerAdapter = ConsoleLoggerAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uc29sZV9sb2dnZXJfYWRhcHRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImNvbnNvbGVfbG9nZ2VyX2FkYXB0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBaUQ7QUFFakQsZ0RBQTRDO0FBRTVDLE1BQWEsb0JBQXFCLFNBQVEsOEJBQWE7SUFDL0MsR0FBRyxDQUFDLEdBQVE7UUFDbEIsTUFBTSxFQUFFLE1BQU0sRUFBRSxRQUFRLEVBQUUsSUFBSSxFQUFFLEdBQUcsR0FBRyxDQUFDO1FBRXZDLElBQUksT0FBTyxHQUFHLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDckIsSUFBSSxNQUFNLEVBQUU7WUFDWCxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDO1NBQ3JCO1FBRUQsUUFBUSxRQUFRLEVBQUU7WUFDakIsS0FBSyxvQkFBUSxDQUFDLElBQUk7Z0JBQ2pCLE9BQU8sQ0FBQyxJQUFJLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDekIsTUFBTTtZQUNQLEtBQUssb0JBQVEsQ0FBQyxLQUFLO2dCQUNsQixPQUFPLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLENBQUM7Z0JBQzFCLE1BQU07WUFDUCxLQUFLLG9CQUFRLENBQUMsSUFBSTtnQkFDakIsT0FBTyxDQUFDLElBQUksQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFDO2dCQUN6QixNQUFNO1lBQ1AsS0FBSyxvQkFBUSxDQUFDLEtBQUs7Z0JBQ2xCLE9BQU8sQ0FBQyxLQUFLLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQztnQkFDMUIsTUFBTTtZQUNQO2dCQUNDLE1BQU0sSUFBSSxLQUFLLENBQUMsR0FBRyxRQUFRLDJCQUEyQixDQUFDLENBQUM7U0FDekQ7SUFDRixDQUFDO0NBQ0Q7QUExQkQsb0RBMEJDIn0=