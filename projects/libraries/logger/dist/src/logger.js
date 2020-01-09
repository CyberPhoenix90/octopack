"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const log_level_1 = require("./log/log_level");
class Logger {
    constructor(configuration) {
        this.configuration = configuration;
    }
    info(logData) {
        this.log(logData, log_level_1.LogLevel.INFO);
    }
    debug(logData) {
        this.log(logData, log_level_1.LogLevel.DEBUG);
    }
    warn(logData) {
        this.log(logData, log_level_1.LogLevel.WARN);
    }
    error(logData) {
        this.log(logData, log_level_1.LogLevel.ERROR);
    }
    log(logData, logLevel) {
        const { enhancers = [], adapters } = this.configuration;
        if (!adapters.length) {
            return;
        }
        let log = this.createLog(logData, logLevel);
        for (const enhancer of enhancers) {
            log = enhancer.enhance(log);
            if (!log) {
                return;
            }
        }
        for (const adapter of adapters) {
            adapter.log(log);
        }
    }
    addAdapter(adapter) {
        this.configuration.adapters.push(adapter);
    }
    createLog(logData, logLevel) {
        let text = '';
        let object;
        if (typeof logData === 'string') {
            text = logData;
        }
        else {
            object = logData;
        }
        return { logLevel, object, text };
    }
}
exports.Logger = Logger;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibG9nZ2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibG9nZ2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0NBQTJDO0FBSTNDLE1BQWEsTUFBTTtJQUdsQixZQUFZLGFBQWtDO1FBQzdDLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3BDLENBQUM7SUFFTSxJQUFJLENBQUMsT0FBWTtRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxvQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBWTtRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxvQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFTSxJQUFJLENBQUMsT0FBWTtRQUN2QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxvQkFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ2xDLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBWTtRQUN4QixJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxvQkFBUSxDQUFDLEtBQUssQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFTSxHQUFHLENBQUMsT0FBWSxFQUFFLFFBQWtCO1FBQzFDLE1BQU0sRUFBRSxTQUFTLEdBQUcsRUFBRSxFQUFFLFFBQVEsRUFBRSxHQUFHLElBQUksQ0FBQyxhQUFhLENBQUM7UUFDeEQsSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUU7WUFDckIsT0FBTztTQUNQO1FBRUQsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUM7UUFFNUMsS0FBSyxNQUFNLFFBQVEsSUFBSSxTQUFTLEVBQUU7WUFDakMsR0FBRyxHQUFHLFFBQVEsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUM7WUFDNUIsSUFBSSxDQUFDLEdBQUcsRUFBRTtnQkFDVCxPQUFPO2FBQ1A7U0FDRDtRQUVELEtBQUssTUFBTSxPQUFPLElBQUksUUFBUSxFQUFFO1lBQy9CLE9BQU8sQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUM7U0FDakI7SUFDRixDQUFDO0lBRU0sVUFBVSxDQUFDLE9BQXNCO1FBQ3ZDLElBQUksQ0FBQyxhQUFhLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU8sU0FBUyxDQUFDLE9BQVksRUFBRSxRQUFrQjtRQUNqRCxJQUFJLElBQUksR0FBRyxFQUFFLENBQUM7UUFDZCxJQUFJLE1BQVcsQ0FBQztRQUVoQixJQUFJLE9BQU8sT0FBTyxLQUFLLFFBQVEsRUFBRTtZQUNoQyxJQUFJLEdBQUcsT0FBTyxDQUFDO1NBQ2Y7YUFBTTtZQUNOLE1BQU0sR0FBRyxPQUFPLENBQUM7U0FDakI7UUFFRCxPQUFPLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxJQUFJLEVBQUUsQ0FBQztJQUNuQyxDQUFDO0NBQ0Q7QUEzREQsd0JBMkRDIn0=