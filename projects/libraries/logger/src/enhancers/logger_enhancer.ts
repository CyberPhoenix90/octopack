import { Log } from '../log/log';

export type LoggerEnhancer = (log: Log) => Log | undefined;
