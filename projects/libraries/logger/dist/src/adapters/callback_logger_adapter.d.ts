import { Log } from '../log/log';
import { LoggerAdapter } from './logger_adapter';
export declare class CallbackLoggerAdapter extends LoggerAdapter {
    private callback;
    constructor(callback: (log: Log) => void);
    log(log: Log): void;
}
//# sourceMappingURL=callback_logger_adapter.d.ts.map