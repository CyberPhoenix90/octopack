"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const http = require("http");
const minimatch = require("minimatch");
(function (HTTPVerb) {
    HTTPVerb["POST"] = "POST";
    HTTPVerb["GET"] = "GET";
    HTTPVerb["PUT"] = "PUT";
    HTTPVerb["DELETE"] = "DELETE";
    HTTPVerb["HEAD"] = "HEAD";
    HTTPVerb["OPTIONS"] = "OPTIONS";
})(exports.HTTPVerb || (exports.HTTPVerb = {}));
class WebServer {
    constructor(config) {
        this.config = config;
        this.endpoints = {};
        this.notFoundHandlers = [];
        this.serverErrorHandlers = [];
    }
    addEndpoint(method, urlPattern, handler) {
        this.endpoints[urlPattern] = {
            handler,
            method
        };
    }
    addNotFoundHandler(handler) {
        this.notFoundHandlers.push(handler);
    }
    addServerErrorHandler(handler) {
        this.serverErrorHandlers.push(handler);
    }
    listen() {
        this.server = new http.Server((req, res) => this.onMessage(req, res));
        return new Promise((resolve, reject) => {
            var _a;
            try {
                this.server.listen(this.config.port, (_a = this.config.ip, (_a !== null && _a !== void 0 ? _a : '0.0.0.0')), () => {
                    resolve();
                });
            }
            catch (e) {
                reject(e);
            }
        });
    }
    getMessageHandlers(url, verb) {
        const handlers = [];
        for (const endpoint of Object.keys(this.endpoints)) {
            if (minimatch(url, endpoint)) {
                if (this.endpoints[endpoint].method === verb || this.endpoints[endpoint].method === '*') {
                    handlers.push({ score: endpoint.length, handler: this.endpoints[endpoint].handler });
                }
            }
        }
        return handlers.sort((a, b) => b.score - a.score).map((p) => p.handler);
    }
    onMessage(req, res) {
        const chunks = [];
        req.on('data', (chunk) => {
            chunks.push(chunk);
        });
        req.on('end', async () => {
            const data = Buffer.concat(chunks);
            const wrappedRequest = {
                body: data,
                url: req.url,
                method: req.method
            };
            try {
                for (const handler of this.getMessageHandlers(req.url, req.method)) {
                    let cont = false;
                    await handler(wrappedRequest, res, () => {
                        cont = true;
                    });
                    if (!cont) {
                        return;
                    }
                }
                try {
                    for (const handler of this.notFoundHandlers) {
                        let cont = false;
                        await handler(wrappedRequest, res, () => {
                            cont = true;
                        });
                        if (!cont) {
                            return;
                        }
                    }
                    res.statusCode = 404;
                    res.statusMessage = `Not Found`;
                    res.write('Error 404 Not found');
                    res.end();
                }
                catch (e2) {
                    res.statusCode = 500;
                    res.statusMessage = `Server error ${e2} occured while trying to deliver not found page`;
                    res.end();
                }
            }
            catch (e) {
                try {
                    for (const handler of this.serverErrorHandlers) {
                        let cont = false;
                        await handler(e, wrappedRequest, res, () => {
                            cont = true;
                        });
                        if (!cont) {
                            return;
                        }
                    }
                }
                catch (e2) {
                    res.statusCode = 500;
                    res.statusMessage = `Server error ${e2} occured while trying to handle server error ${e}`;
                    res.end();
                }
            }
        });
    }
}
exports.WebServer = WebServer;
function getMimeType(extension) {
    switch (extension) {
        case 'html':
            return 'text/html';
        case 'js':
            return 'text/javascript';
        case 'css':
            return 'text/css';
        case 'woff2':
            return 'font/woff2';
        default:
            return 'text/plain';
    }
}
exports.getMimeType = getMimeType;