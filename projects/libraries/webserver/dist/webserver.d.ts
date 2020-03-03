/// <reference types="node" />
import * as http from 'http';
export declare enum HTTPVerb {
    POST = 0,
    GET = 1,
    PUT = 2,
    DELETE = 3,
    HEAD = 4,
    OPTIONS = 5
}
export interface WebServerConfig {
    port: number;
    ip?: string;
}
export interface HttpRequest {
    url: string;
    body: Buffer;
    method: HTTPVerb;
}
export declare type ServerErrorHandler = (error: Error, req: HttpRequest, res: http.ServerResponse, next: () => void) => void | Promise<void>;
export declare type MessageHandler = (req: HttpRequest, res: http.ServerResponse, next: () => void) => void | Promise<void>;
export declare class WebServer {
    private config;
    private server;
    private endpoints;
    private notFoundHandlers;
    private serverErrorHandlers;
    constructor(config: WebServerConfig);
    addEndpoint(method: HTTPVerb | '*', urlPattern: string, handler: MessageHandler): void;
    addNotFoundHandler(handler: MessageHandler): void;
    addServerErrorHandler(handler: (error: Error, req: HttpRequest, res: http.ServerResponse, next: () => void) => void | Promise<void>): void;
    listen(): Promise<void>;
    private getMessageHandlers;
    private onMessage;
}
//# sourceMappingURL=webserver.d.ts.map