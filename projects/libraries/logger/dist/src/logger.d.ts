import { LoggerConfiguration } from './logger_configuration';
export declare class Logger {
    private configuration;
    constructor(configuration: LoggerConfiguration);
    info(logData: any): void;
    debug(logData: any): void;
    warn(logData: any): void;
    error(logData: any): void;
    private log;
    private createLog;
}
//# sourceMappingURL=logger.d.ts.map