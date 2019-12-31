import { LoggerEnhancer } from './logger_enhancer';

export const PassThroughLoggerEnhancer: LoggerEnhancer = (log) => {
	return log;
};
