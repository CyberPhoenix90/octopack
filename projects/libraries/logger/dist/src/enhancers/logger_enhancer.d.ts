import { Log } from '../log/log';
export declare type EnhancedLog = Log | undefined;
export declare abstract class LoggerEnhancer {
    abstract enhance(log: Log): EnhancedLog;
}
//# sourceMappingURL=logger_enhancer.d.ts.map