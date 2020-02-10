"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const logger_1 = require("logger");
const message_types_1 = require("./message_definitions/message_types");
const api_1 = require("api");
const path_1 = require("path");
class Server {
    constructor(config) {
        const { port = 8080 } = config;
        if (port >= 1024 && port <= 49151) {
            this.port = port;
        }
        else {
            throw new Error(`${port} is not allowed to be used as a port. Aborting creation of server.`);
        }
        const devLogger = new logger_1.Logger({
            adapters: [new logger_1.WriteFileLoggerAdapter(path_1.join(__dirname, '../log.txt'))],
            enhancers: [new logger_1.LogLevelPrependerLoggerEnhancer()]
        });
        const uiLogger = new logger_1.Logger({
            adapters: [
                new logger_1.ConsoleLoggerAdapter(),
                new logger_1.CallbackLoggerAdapter((log) => { var _a; return devLogger.log((_a = log.text, (_a !== null && _a !== void 0 ? _a : log.object)), log.logLevel); })
            ],
            enhancers: [new logger_1.LogLevelPrependerLoggerEnhancer()]
        });
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
            this.uiLogger.info('A client connected');
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
                        this.uiLogger.error(`Received message without defined type. It cannot be handled. Received message: ${message}`);
                    }
                }
                else {
                    this.uiLogger.error(`Received message that wasn't a string. It cannot be handled. Received message: ${message}`);
                }
            });
            socket.on('close', () => {
                this.uiLogger.info('A client disconnected');
            });
        });
        this.uiLogger.info('Server launched');
    }
    close() {
        if (this.server) {
            this.server.close();
        }
    }
    async processMessage(message) {
        const { type, data } = message;
        switch (type) {
            case message_types_1.MessageTypes.LOGS_REQUEST:
                return { type: message_types_1.MessageTypes.LOGS_RESPONSE, data: this.logs };
            case message_types_1.MessageTypes.BUILD_REQUEST:
                return this.runBuildScript(data);
        }
        this.uiLogger.error(`${type} does not have any handling. The server will not process this message.`);
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