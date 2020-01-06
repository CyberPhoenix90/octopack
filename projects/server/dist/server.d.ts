import { ServerConfiguration } from './server_configuration';
export declare class Server {
    private server;
    private port;
    private uiLogger;
    private devLogger;
    private logs;
    constructor(config: ServerConfiguration);
    initialize(): void;
    close(): void;
    private logForEveryContext;
    private processMessage;
}
//# sourceMappingURL=server.d.ts.map