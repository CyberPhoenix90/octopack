"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const logger_1 = require("../../libraries/logger");
const message_types_1 = require("./message_definitions/message_types");
const api_1 = require("../../api");
class Server {
    constructor(config) {
        const { port = 8080, loggingContexts: loggingContext = { uiLogger: undefined, devLogger: undefined } } = config;
        if (port >= 1024 && port <= 49151) {
            this.port = port;
        }
        else {
            throw new Error(`${port} is not allowed to be used as a port. Aborting creation of server.`);
        }
        const { uiLogger = new logger_1.Logger({ adapters: [], enhancers: [] }), devLogger = new logger_1.Logger({ adapters: [], enhancers: [] }) } = loggingContext;
        this.uiLogger = uiLogger;
        this.devLogger = devLogger;
        this.logs = [];
        this.devLogger.addAdapter(new logger_1.CallbackLoggerAdapter((log) => {
            this.logs.push(log);
        }));
    }
    initialize() {
        this.server = new WebSocket.Server({ port: this.port });
        this.server.on('connection', (socket) => {
            this.logForEveryContext('A client connected', logger_1.LogLevel.INFO);
            socket.on('message', async (message) => {
                var _a;
                if (typeof message === 'string') {
                    const data = JSON.parse(message);
                    if (((_a = data) === null || _a === void 0 ? void 0 : _a.type) !== undefined) {
                        const response = await this.processMessage(data);
                        if (response) {
                            socket.send(JSON.stringify(response));
                        }
                    }
                    else {
                        this.logForEveryContext(`Received message without defined type. It cannot be handled. Received message: ${message}`, logger_1.LogLevel.ERROR);
                    }
                }
                else {
                    this.logForEveryContext(`Received message that wasn't a string. It cannot be handled. Received message: ${message}`, logger_1.LogLevel.ERROR);
                }
            });
            socket.on('close', () => {
                this.logForEveryContext('A client disconnected', logger_1.LogLevel.INFO);
            });
        });
        this.logForEveryContext('Server launched', logger_1.LogLevel.INFO);
    }
    close() {
        if (this.server) {
            this.server.close();
        }
    }
    logForEveryContext(logData, logLevel) {
        this.uiLogger.log(logData, logLevel);
        this.devLogger.log(logData, logLevel);
    }
    async processMessage(message) {
        const { type, data } = message;
        switch (type) {
            case message_types_1.MessageTypes.LOGS_REQUEST:
                return { type: message_types_1.MessageTypes.LOGS_RESPONSE, data: this.logs };
            case message_types_1.MessageTypes.BUILD_REQUEST:
                return this.runBuildScript(data);
        }
        this.logForEveryContext(`${type} does not have any handling. The server will not process this message.`, logger_1.LogLevel.ERROR);
        return undefined;
    }
    async runBuildScript(data) {
        const { args, context } = data;
        const { fileSystem, workspaceConfig, workspaceRoot } = context;
        return {
            type: message_types_1.MessageTypes.BUILD_RESPONSE,
            data: await new api_1.Build().run(args, {
                devLogger: this.devLogger,
                uiLogger: this.uiLogger,
                fileSystem: fileSystem,
                workspaceRoot,
                workspaceConfig
            })
        };
    }
}
exports.Server = Server;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VydmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2VydmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0NBQWdDO0FBQ2hDLG1EQUFzRjtBQUV0Rix1RUFBbUU7QUFHbkUsbUNBQWtDO0FBRWxDLE1BQWEsTUFBTTtJQVFsQixZQUFZLE1BQTJCO1FBQ3RDLE1BQU0sRUFBRSxJQUFJLEdBQUcsSUFBSSxFQUFFLGVBQWUsRUFBRSxjQUFjLEdBQUcsRUFBRSxRQUFRLEVBQUUsU0FBUyxFQUFFLFNBQVMsRUFBRSxTQUFTLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQztRQUVoSCxJQUFJLElBQUksSUFBSSxJQUFJLElBQUksSUFBSSxJQUFJLEtBQUssRUFBRTtZQUNsQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQztTQUNqQjthQUFNO1lBQ04sTUFBTSxJQUFJLEtBQUssQ0FBQyxHQUFHLElBQUksb0VBQW9FLENBQUMsQ0FBQztTQUM3RjtRQUVELE1BQU0sRUFDTCxRQUFRLEdBQUcsSUFBSSxlQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN0RCxTQUFTLEdBQUcsSUFBSSxlQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUN2RCxHQUFHLGNBQWMsQ0FBQztRQUNuQixJQUFJLENBQUMsUUFBUSxHQUFHLFFBQVEsQ0FBQztRQUN6QixJQUFJLENBQUMsU0FBUyxHQUFHLFNBQVMsQ0FBQztRQUUzQixJQUFJLENBQUMsSUFBSSxHQUFHLEVBQUUsQ0FBQztRQUNmLElBQUksQ0FBQyxTQUFTLENBQUMsVUFBVSxDQUN4QixJQUFJLDhCQUFxQixDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUU7WUFDakMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDckIsQ0FBQyxDQUFDLENB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