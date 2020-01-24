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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlcnZlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6InNlcnZlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyJcInVzZSBzdHJpY3RcIjtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IFdlYlNvY2tldCA9IHJlcXVpcmUoXCJ3c1wiKTtcbmNvbnN0IGxvZ2dlcl8xID0gcmVxdWlyZShcImxvZ2dlclwiKTtcbmNvbnN0IG1lc3NhZ2VfdHlwZXNfMSA9IHJlcXVpcmUoXCIuL21lc3NhZ2VfZGVmaW5pdGlvbnMvbWVzc2FnZV90eXBlc1wiKTtcbmNvbnN0IGFwaV8xID0gcmVxdWlyZShcImFwaVwiKTtcbmNvbnN0IHBhdGhfMSA9IHJlcXVpcmUoXCJwYXRoXCIpO1xuY2xhc3MgU2VydmVyIHtcbiAgICBjb25zdHJ1Y3Rvcihjb25maWcpIHtcbiAgICAgICAgY29uc3QgeyBwb3J0ID0gODA4MCB9ID0gY29uZmlnO1xuICAgICAgICBpZiAocG9ydCA+PSAxMDI0ICYmIHBvcnQgPD0gNDkxNTEpIHtcbiAgICAgICAgICAgIHRoaXMucG9ydCA9IHBvcnQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYCR7cG9ydH0gaXMgbm90IGFsbG93ZWQgdG8gYmUgdXNlZCBhcyBhIHBvcnQuIEFib3J0aW5nIGNyZWF0aW9uIG9mIHNlcnZlci5gKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBkZXZMb2dnZXIgPSBuZXcgbG9nZ2VyXzEuTG9nZ2VyKHtcbiAgICAgICAgICAgIGFkYXB0ZXJzOiBbbmV3IGxvZ2dlcl8xLldyaXRlRmlsZUxvZ2dlckFkYXB0ZXIocGF0aF8xLmpvaW4oX19kaXJuYW1lLCAnLi4vbG9nLnR4dCcpKV0sXG4gICAgICAgICAgICBlbmhhbmNlcnM6IFtuZXcgbG9nZ2VyXzEuTG9nTGV2ZWxQcmVwZW5kZXJMb2dnZXJFbmhhbmNlcigpXVxuICAgICAgICB9KTtcbiAgICAgICAgY29uc3QgdWlMb2dnZXIgPSBuZXcgbG9nZ2VyXzEuTG9nZ2VyKHtcbiAgICAgICAgICAgIGFkYXB0ZXJzOiBbXG4gICAgICAgICAgICAgICAgbmV3IGxvZ2dlcl8xLkNvbnNvbGVMb2dnZXJBZGFwdGVyKCksXG4gICAgICAgICAgICAgICAgbmV3IGxvZ2dlcl8xLkNhbGxiYWNrTG9nZ2VyQWRhcHRlcigobG9nKSA9PiB7IHZhciBfYTsgcmV0dXJuIGRldkxvZ2dlci5sb2coKF9hID0gbG9nLnRleHQsIChfYSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiBsb2cub2JqZWN0KSksIGxvZy5sb2dMZXZlbCk7IH0pXG4gICAgICAgICAgICBdLFxuICAgICAgICAgICAgZW5oYW5jZXJzOiBbbmV3IGxvZ2dlcl8xLkxvZ0xldmVsUHJlcGVuZGVyTG9nZ2VyRW5oYW5jZXIoKV1cbiAgICAgICAgfSk7XG4gICAgICAgIHRoaXMudWlMb2dnZXIgPSB1aUxvZ2dlcjtcbiAgICAgICAgdGhpcy5kZXZMb2dnZXIgPSBkZXZMb2dnZXI7XG4gICAgICAgIHRoaXMubG9ncyA9IFtdO1xuICAgICAgICB0aGlzLmRldkxvZ2dlci5hZGRBZGFwdGVyKG5ldyBsb2dnZXJfMS5DYWxsYmFja0xvZ2dlckFkYXB0ZXIoKGxvZykgPT4ge1xuICAgICAgICAgICAgdGhpcy5sb2dzLnB1c2gobG9nKTtcbiAgICAgICAgfSkpO1xuICAgIH1cbiAgICBpbml0aWFsaXplKCkge1xuICAgICAgICB0aGlzLnNlcnZlciA9IG5ldyBXZWJTb2NrZXQuU2VydmVyKHsgcG9ydDogdGhpcy5wb3J0IH0pO1xuICAgICAgICB0aGlzLnNlcnZlci5vbignY29ubmVjdGlvbicsIChzb2NrZXQpID0+IHtcbiAgICAgICAgICAgIHRoaXMudWlMb2dnZXIuaW5mbygnQSBjbGllbnQgY29ubmVjdGVkJyk7XG4gICAgICAgICAgICBzb2NrZXQub24oJ21lc3NhZ2UnLCBhc3luYyAobWVzc2FnZSkgPT4ge1xuICAgICAgICAgICAgICAgIHZhciBfYTtcbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIG1lc3NhZ2UgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKG1lc3NhZ2UpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoKChfYSA9IGRhdGEpID09PSBudWxsIHx8IF9hID09PSB2b2lkIDAgPyB2b2lkIDAgOiBfYS50eXBlKSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IHRoaXMucHJvY2Vzc01lc3NhZ2UoZGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzb2NrZXQuc2VuZChKU09OLnN0cmluZ2lmeShyZXNwb25zZSkpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy51aUxvZ2dlci5lcnJvcihgUmVjZWl2ZWQgbWVzc2FnZSB3aXRob3V0IGRlZmluZWQgdHlwZS4gSXQgY2Fubm90IGJlIGhhbmRsZWQuIFJlY2VpdmVkIG1lc3NhZ2U6ICR7bWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy51aUxvZ2dlci5lcnJvcihgUmVjZWl2ZWQgbWVzc2FnZSB0aGF0IHdhc24ndCBhIHN0cmluZy4gSXQgY2Fubm90IGJlIGhhbmRsZWQuIFJlY2VpdmVkIG1lc3NhZ2U6ICR7bWVzc2FnZX1gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIHNvY2tldC5vbignY2xvc2UnLCAoKSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy51aUxvZ2dlci5pbmZvKCdBIGNsaWVudCBkaXNjb25uZWN0ZWQnKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy51aUxvZ2dlci5pbmZvKCdTZXJ2ZXIgbGF1bmNoZWQnKTtcbiAgICB9XG4gICAgY2xvc2UoKSB7XG4gICAgICAgIGlmICh0aGlzLnNlcnZlcikge1xuICAgICAgICAgICAgdGhpcy5zZXJ2ZXIuY2xvc2UoKTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBwcm9jZXNzTWVzc2FnZShtZXNzYWdlKSB7XG4gICAgICAgIGNvbnN0IHsgdHlwZSwgZGF0YSB9ID0gbWVzc2FnZTtcbiAgICAgICAgc3dpdGNoICh0eXBlKSB7XG4gICAgICAgICAgICBjYXNlIG1lc3NhZ2VfdHlwZXNfMS5NZXNzYWdlVHlwZXMuTE9HU19SRVFVRVNUOlxuICAgICAgICAgICAgICAgIHJldHVybiB7IHR5cGU6IG1lc3NhZ2VfdHlwZXNfMS5NZXNzYWdlVHlwZXMuTE9HU19SRVNQT05TRSwgZGF0YTogdGhpcy5sb2dzIH07XG4gICAgICAgICAgICBjYXNlIG1lc3NhZ2VfdHlwZXNfMS5NZXNzYWdlVHlwZXMuQlVJTERfUkVRVUVTVDpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5ydW5CdWlsZFNjcmlwdChkYXRhKTtcbiAgICAgICAgfVxuICAgICAgICB0aGlzLnVpTG9nZ2VyLmVycm9yKGAke3R5cGV9IGRvZXMgbm90IGhhdmUgYW55IGhhbmRsaW5nLiBUaGUgc2VydmVyIHdpbGwgbm90IHByb2Nlc3MgdGhpcyBtZXNzYWdlLmApO1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cbiAgICBhc3luYyBydW5CdWlsZFNjcmlwdChkYXRhKSB7XG4gICAgICAgIGNvbnN0IHsgYXJncywgY29udGV4dCB9ID0gZGF0YTtcbiAgICAgICAgY29uc3QgeyBmaWxlU3lzdGVtLCB3b3Jrc3BhY2VDb25maWcsIHdvcmtzcGFjZVJvb3QgfSA9IGNvbnRleHQ7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICB0eXBlOiBtZXNzYWdlX3R5cGVzXzEuTWVzc2FnZVR5cGVzLkJVSUxEX1JFU1BPTlNFLFxuICAgICAgICAgICAgZGF0YTogYXdhaXQgbmV3IGFwaV8xLkJ1aWxkKCkucnVuKGFyZ3MsIHtcbiAgICAgICAgICAgICAgICBkZXZMb2dnZXI6IHRoaXMuZGV2TG9nZ2VyLFxuICAgICAgICAgICAgICAgIHVpTG9nZ2VyOiB0aGlzLnVpTG9nZ2VyLFxuICAgICAgICAgICAgICAgIGZpbGVTeXN0ZW06IGZpbGVTeXN0ZW0sXG4gICAgICAgICAgICAgICAgd29ya3NwYWNlUm9vdCxcbiAgICAgICAgICAgICAgICB3b3Jrc3BhY2VDb25maWdcbiAgICAgICAgICAgIH0pXG4gICAgICAgIH07XG4gICAgfVxufVxuZXhwb3J0cy5TZXJ2ZXIgPSBTZXJ2ZXI7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2ljMlZ5ZG1WeUxtcHpJaXdpYzI5MWNtTmxVbTl2ZENJNklpSXNJbk52ZFhKalpYTWlPbHNpYzJWeWRtVnlMbXB6SWwwc0ltNWhiV1Z6SWpwYlhTd2liV0Z3Y0dsdVozTWlPaUk3TzBGQlFVRXNaME5CUVdkRE8wRkJRMmhETEcxRFFVRnpTVHRCUVVOMFNTeDFSVUZCYlVVN1FVRkRia1VzTmtKQlFUUkNPMEZCUXpWQ0xDdENRVUUwUWp0QlFVTTFRaXhOUVVGaExFMUJRVTA3U1VGRFppeFpRVUZaTEUxQlFVMDdVVUZEWkN4TlFVRk5MRVZCUVVVc1NVRkJTU3hIUVVGSExFbEJRVWtzUlVGQlJTeEhRVUZITEUxQlFVMHNRMEZCUXp0UlFVTXZRaXhKUVVGSkxFbEJRVWtzU1VGQlNTeEpRVUZKTEVsQlFVa3NTVUZCU1N4SlFVRkpMRXRCUVVzc1JVRkJSVHRaUVVNdlFpeEpRVUZKTEVOQlFVTXNTVUZCU1N4SFFVRkhMRWxCUVVrc1EwRkJRenRUUVVOd1FqdGhRVU5KTzFsQlEwUXNUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhIUVVGSExFbEJRVWtzYjBWQlFXOUZMRU5CUVVNc1EwRkJRenRUUVVOb1J6dFJRVU5FTEUxQlFVMHNVMEZCVXl4SFFVRkhMRWxCUVVrc1pVRkJUU3hEUVVGRE8xbEJRM3BDTEZGQlFWRXNSVUZCUlN4RFFVRkRMRWxCUVVrc0swSkJRWE5DTEVOQlFVTXNWMEZCU1N4RFFVRkRMRk5CUVZNc1JVRkJSU3haUVVGWkxFTkJRVU1zUTBGQlF5eERRVUZETzFsQlEzSkZMRk5CUVZNc1JVRkJSU3hEUVVGRExFbEJRVWtzZDBOQlFTdENMRVZCUVVVc1EwRkJRenRUUVVOeVJDeERRVUZETEVOQlFVTTdVVUZEU0N4TlFVRk5MRkZCUVZFc1IwRkJSeXhKUVVGSkxHVkJRVTBzUTBGQlF6dFpRVU40UWl4UlFVRlJMRVZCUVVVN1owSkJRMDRzU1VGQlNTdzJRa0ZCYjBJc1JVRkJSVHRuUWtGRE1VSXNTVUZCU1N3NFFrRkJjVUlzUTBGQlF5eERRVUZETEVkQlFVY3NSVUZCUlN4RlFVRkZMRWRCUVVjc1NVRkJTU3hGUVVGRkxFTkJRVU1zUTBGQlF5eFBRVUZQTEZOQlFWTXNRMEZCUXl4SFFVRkhMRU5CUVVNc1EwRkJReXhGUVVGRkxFZEJRVWNzUjBGQlJ5eERRVUZETEVsQlFVa3NSVUZCUlN4RFFVRkRMRVZCUVVVc1MwRkJTeXhKUVVGSkxFbEJRVWtzUlVGQlJTeExRVUZMTEV0QlFVc3NRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXl4TlFVRk5MRU5CUVVNc1EwRkJReXhGUVVGRkxFZEJRVWNzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRenRoUVVONlNqdFpRVU5FTEZOQlFWTXNSVUZCUlN4RFFVRkRMRWxCUVVrc2QwTkJRU3RDTEVWQlFVVXNRMEZCUXp0VFFVTnlSQ3hEUVVGRExFTkJRVU03VVVGRFNDeEpRVUZKTEVOQlFVTXNVVUZCVVN4SFFVRkhMRkZCUVZFc1EwRkJRenRSUVVONlFpeEpRVUZKTEVOQlFVTXNVMEZCVXl4SFFVRkhMRk5CUVZNc1EwRkJRenRSUVVNelFpeEpRVUZKTEVOQlFVTXNTVUZCU1N4SFFVRkhMRVZCUVVVc1EwRkJRenRSUVVObUxFbEJRVWtzUTBGQlF5eFRRVUZUTEVOQlFVTXNWVUZCVlN4RFFVRkRMRWxCUVVrc09FSkJRWEZDTEVOQlFVTXNRMEZCUXl4SFFVRkhMRVZCUVVVc1JVRkJSVHRaUVVONFJDeEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFJRVU40UWl4RFFVRkRMRU5CUVVNc1EwRkJReXhEUVVGRE8wbEJRMUlzUTBGQlF6dEpRVU5FTEZWQlFWVTdVVUZEVGl4SlFVRkpMRU5CUVVNc1RVRkJUU3hIUVVGSExFbEJRVWtzVTBGQlV5eERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkZMRWxCUVVrc1JVRkJSU3hKUVVGSkxFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNRMEZCUXp0UlFVTjRSQ3hKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETEVWQlFVVXNRMEZCUXl4WlFVRlpMRVZCUVVVc1EwRkJReXhOUVVGTkxFVkJRVVVzUlVGQlJUdFpRVU53UXl4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eHZRa0ZCYjBJc1EwRkJReXhEUVVGRE8xbEJRM3BETEUxQlFVMHNRMEZCUXl4RlFVRkZMRU5CUVVNc1UwRkJVeXhGUVVGRkxFdEJRVXNzUlVGQlJTeFBRVUZQTEVWQlFVVXNSVUZCUlR0blFrRkRia01zU1VGQlNTeEZRVUZGTEVOQlFVTTdaMEpCUTFBc1NVRkJTU3hQUVVGUExFOUJRVThzUzBGQlN5eFJRVUZSTEVWQlFVVTdiMEpCUXpkQ0xFMUJRVTBzU1VGQlNTeEhRVUZITEVsQlFVa3NRMEZCUXl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExFTkJRVU03YjBKQlEycERMRWxCUVVrc1EwRkJReXhEUVVGRExFVkJRVVVzUjBGQlJ5eEpRVUZKTEVOQlFVTXNTMEZCU3l4SlFVRkpMRWxCUVVrc1JVRkJSU3hMUVVGTExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJReXhEUVVGRExFTkJRVU1zUlVGQlJTeERRVUZETEVsQlFVa3NRMEZCUXl4TFFVRkxMRk5CUVZNc1JVRkJSVHQzUWtGRE1VVXNUVUZCVFN4UlFVRlJMRWRCUVVjc1RVRkJUU3hKUVVGSkxFTkJRVU1zWTBGQll5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPM2RDUVVOcVJDeEpRVUZKTEZGQlFWRXNSVUZCUlRzMFFrRkRWaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4VFFVRlRMRU5CUVVNc1VVRkJVU3hEUVVGRExFTkJRVU1zUTBGQlF6dDVRa0ZEZWtNN2NVSkJRMG83ZVVKQlEwazdkMEpCUTBRc1NVRkJTU3hEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNhMFpCUVd0R0xFOUJRVThzUlVGQlJTeERRVUZETEVOQlFVTTdjVUpCUTNCSU8ybENRVU5LTzNGQ1FVTkpPMjlDUVVORUxFbEJRVWtzUTBGQlF5eFJRVUZSTEVOQlFVTXNTMEZCU3l4RFFVRkRMR3RHUVVGclJpeFBRVUZQTEVWQlFVVXNRMEZCUXl4RFFVRkRPMmxDUVVOd1NEdFpRVU5NTEVOQlFVTXNRMEZCUXl4RFFVRkRPMWxCUTBnc1RVRkJUU3hEUVVGRExFVkJRVVVzUTBGQlF5eFBRVUZQTEVWQlFVVXNSMEZCUnl4RlFVRkZPMmRDUVVOd1FpeEpRVUZKTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXgxUWtGQmRVSXNRMEZCUXl4RFFVRkRPMWxCUTJoRUxFTkJRVU1zUTBGQlF5eERRVUZETzFGQlExQXNRMEZCUXl4RFFVRkRMRU5CUVVNN1VVRkRTQ3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEVsQlFVa3NRMEZCUXl4cFFrRkJhVUlzUTBGQlF5eERRVUZETzBsQlF6RkRMRU5CUVVNN1NVRkRSQ3hMUVVGTE8xRkJRMFFzU1VGQlNTeEpRVUZKTEVOQlFVTXNUVUZCVFN4RlFVRkZPMWxCUTJJc1NVRkJTU3hEUVVGRExFMUJRVTBzUTBGQlF5eExRVUZMTEVWQlFVVXNRMEZCUXp0VFFVTjJRanRKUVVOTUxFTkJRVU03U1VGRFJDeExRVUZMTEVOQlFVTXNZMEZCWXl4RFFVRkRMRTlCUVU4N1VVRkRlRUlzVFVGQlRTeEZRVUZGTEVsQlFVa3NSVUZCUlN4SlFVRkpMRVZCUVVVc1IwRkJSeXhQUVVGUExFTkJRVU03VVVGREwwSXNVVUZCVVN4SlFVRkpMRVZCUVVVN1dVRkRWaXhMUVVGTExEUkNRVUZaTEVOQlFVTXNXVUZCV1R0blFrRkRNVUlzVDBGQlR5eEZRVUZGTEVsQlFVa3NSVUZCUlN3MFFrRkJXU3hEUVVGRExHRkJRV0VzUlVGQlJTeEpRVUZKTEVWQlFVVXNTVUZCU1N4RFFVRkRMRWxCUVVrc1JVRkJSU3hEUVVGRE8xbEJRMnBGTEV0QlFVc3NORUpCUVZrc1EwRkJReXhoUVVGaE8yZENRVU16UWl4UFFVRlBMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVMEZEZUVNN1VVRkRSQ3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEV0QlFVc3NRMEZCUXl4SFFVRkhMRWxCUVVrc2QwVkJRWGRGTEVOQlFVTXNRMEZCUXp0UlFVTnlSeXhQUVVGUExGTkJRVk1zUTBGQlF6dEpRVU55UWl4RFFVRkRPMGxCUTBRc1MwRkJTeXhEUVVGRExHTkJRV01zUTBGQlF5eEpRVUZKTzFGQlEzSkNMRTFCUVUwc1JVRkJSU3hKUVVGSkxFVkJRVVVzVDBGQlR5eEZRVUZGTEVkQlFVY3NTVUZCU1N4RFFVRkRPMUZCUXk5Q0xFMUJRVTBzUlVGQlJTeFZRVUZWTEVWQlFVVXNaVUZCWlN4RlFVRkZMR0ZCUVdFc1JVRkJSU3hIUVVGSExFOUJRVThzUTBGQlF6dFJRVU12UkN4UFFVRlBPMWxCUTBnc1NVRkJTU3hGUVVGRkxEUkNRVUZaTEVOQlFVTXNZMEZCWXp0WlFVTnFReXhKUVVGSkxFVkJRVVVzVFVGQlRTeEpRVUZKTEZkQlFVc3NSVUZCUlN4RFFVRkRMRWRCUVVjc1EwRkJReXhKUVVGSkxFVkJRVVU3WjBKQlF6bENMRk5CUVZNc1JVRkJSU3hKUVVGSkxFTkJRVU1zVTBGQlV6dG5Ra0ZEZWtJc1VVRkJVU3hGUVVGRkxFbEJRVWtzUTBGQlF5eFJRVUZSTzJkQ1FVTjJRaXhWUVVGVkxFVkJRVVVzVlVGQlZUdG5Ra0ZEZEVJc1lVRkJZVHRuUWtGRFlpeGxRVUZsTzJGQlEyeENMRU5CUVVNN1UwRkRUQ3hEUVVGRE8wbEJRMDRzUTBGQlF6dERRVU5LTzBGQmNrWkVMSGRDUVhGR1F5SjkiXX0=