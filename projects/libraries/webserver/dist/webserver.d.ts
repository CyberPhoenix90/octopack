/// <reference types="node" />
import * as http from 'http';
export declare enum HTTPVerb {
    POST = "POST",
    GET = "GET",
    PUT = "PUT",
    DELETE = "DELETE",
    HEAD = "HEAD",
    OPTIONS = "OPTIONS"
}
export interface WebServerConfig {
    port: number;
    ip?: string;
}
export interface HttpRequest {
    url: string;
    query?: string;
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
export declare function getMimeType(extension: string): string;
//# sourceMappingURL=webserver.d.ts.map