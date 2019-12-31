import { Log } from '../log/log';
import { LoggerAdapter } from './logger_adapter';
export declare class CallbackLoggerAdapter extends LoggerAdapter {
    protected callback: (...args: any[]) => void;
    constructor(callback: (...args: any[]) => void);
    protected log(log: Log): void;
}
//# sourceMappingURL=callback_logger_adapter.d.ts.map