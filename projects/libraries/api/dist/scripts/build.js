"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const script_1 = require("./script");
class Build extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Builds stuff'
        };
    }
    async run(args, context) {
        console.log(args);
        return {};
    }
}
exports.Build = Build;
//# sourceMappingURL=build.js.map