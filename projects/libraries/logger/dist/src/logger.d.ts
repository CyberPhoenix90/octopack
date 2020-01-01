import { LogLevel } from './log/log_level';
import { LoggerConfiguration } from './logger_configuration';
export declare class Logger {
    private configuration;
    constructor(configuration: LoggerConfiguration);
    info(logData: any): void;
    debug(logData: any): void;
    warn(logData: any): void;
    error(logData: any): void;
    log(logData: any, logLevel: LogLevel): void;
    private createLog;
}
//# sourceMappingURL=logger.d.ts.map