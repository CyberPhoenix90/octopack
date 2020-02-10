"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const script_1 = require("./script");
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
        return {};
    }
}
exports.Host = Host;