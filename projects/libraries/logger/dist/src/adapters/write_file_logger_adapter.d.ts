import { LoggerAdapter } from './logger_adapter';
import { Log } from '../log/log';
export declare class WriteFileLoggerAdapter extends LoggerAdapter {
    protected path: string;
    constructor(path: string);
    log(log: Log): void;
}
//# sourceMappingURL=write_file_logger_adapter.d.ts.map