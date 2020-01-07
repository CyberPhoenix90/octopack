"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const logger_1 = require("../../libraries/logger");
const message_types_1 = require("./message_definitions/message_types");
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
            socket.on('message', (message) => {
                var _a;
                if (typeof message === 'string') {
                    const data = JSON.parse(message);
                    if (((_a = data) === null || _a === void 0 ? void 0 : _a.type) !== undefined) {
                        const response = this.processMessage(data);
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
    processMessage(message) {
        const { type } = message;
        switch (type) {
            case message_types_1.MessageTypes.LOGS_REQUEST:
                return { type: message_types_1.MessageTypes.LOGS_RESPONSE, data: this.logs };
        }
        this.logForEveryContext(`${type} does not have any handling. The server will not process this message.`, logger_1.LogLevel.ERROR);
        return undefined;
    }
}
exports.Server = Server;
// const server = new Server({ loggingContexts: { uiLogger: new Logger({ adapters: [new ConsoleLoggerAdapter()] }) } });
// server.initialize();
//# sourceMappingURL=server.js.map