import { Log } from '../log/log';
import { LoggerAdapter } from './logger_adapter';
export declare class CallbackLoggerAdapter extends LoggerAdapter {
    protected callback: (log: Log) => void;
    constructor(callback: (log: Log) => void);
    protected log(log: Log): void;
}
//# sourceMappingURL=callback_logger_adapter.d.ts.map