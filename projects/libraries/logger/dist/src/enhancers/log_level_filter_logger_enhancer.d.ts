import { LoggerEnhancer, EnhancedLog } from './logger_enhancer';
import { LogLevel } from '../log/log_level';
import { Log } from '../log/log';
export declare class LogLevelFilterLoggerEnhancer extends LoggerEnhancer {
    protected logLevel: LogLevel;
    constructor(logLevel: LogLevel);
    enhance(log: Log): EnhancedLog;
}
//# sourceMappingURL=log_level_filter_logger_enhancer.d.ts.map