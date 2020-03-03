"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const script_1 = require("./script");
const webserver_1 = require("webserver");
const path_1 = require("path");
class Host extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Hosts stuff'
        };
    }
    async run(args, context) {
        const ws = new webserver_1.WebServer({
            port: 8080
        });
        ws.addEndpoint('*', '**', async (req, res, next) => {
            const path = path_1.join(context.workspaceRoot, req.url.substring(1));
            await this.submitFile(context, path, res);
        });
        ws.listen();
        return {};
    }
    async submitFile(context, path, res) {
        if (await context.fileSystem.exists(path)) {
            const content = await context.fileSystem.readFile(path, 'utf8');
            res.writeHead(200, { 'Content-Type': this.getMimeType(path.substring(path.indexOf('.') + 1)) });
            res.write(content);
            res.end();
        }
        else {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.write(`Not found: ${path}`);
            res.end();
        }
    }
    getMimeType(extension) {
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
}
exports.Host = Host;