import { LoggerEnhancer } from './enhancers/logger_enhancer';
import { LoggerAdapter } from './adapters/logger_adapter';

export interface LoggerConfiguration {
	enhancers?: LoggerEnhancer[];
	adapters: LoggerAdapter[];
}
