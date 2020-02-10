"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const script_1 = require("./script");
class Run extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Runs stuff'
        };
    }
    async run(args, context) {
        return {};
    }
}
exports.Run = Run;