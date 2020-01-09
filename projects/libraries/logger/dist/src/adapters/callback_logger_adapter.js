"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const logger_adapter_1 = require("./logger_adapter");
class CallbackLoggerAdapter extends logger_adapter_1.LoggerAdapter {
    constructor(callback) {
        super();
        this.callback = callback;
    }
    log(log) {
        this.callback(log);
    }
}
exports.CallbackLoggerAdapter = CallbackLoggerAdapter;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FsbGJhY2tfbG9nZ2VyX2FkYXB0ZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYWxsYmFja19sb2dnZXJfYWRhcHRlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUNBLHFEQUFpRDtBQUVqRCxNQUFhLHFCQUFzQixTQUFRLDhCQUFhO0lBR3ZELFlBQVksUUFBNEI7UUFDdkMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztJQUMxQixDQUFDO0lBRU0sR0FBRyxDQUFDLEdBQVE7UUFDbEIsSUFBSSxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNwQixDQUFDO0NBQ0Q7QUFYRCxzREFXQyJ9