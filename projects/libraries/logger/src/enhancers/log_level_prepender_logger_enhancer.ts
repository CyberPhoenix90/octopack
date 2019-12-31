import { LoggerEnhancer } from './logger_enhancer';

export const LogLevelPrependerLoggerEnhancer: LoggerEnhancer = (log) => {
	log.text = `[${log.logLevel}] ${log.text}`;
	return log;
};
