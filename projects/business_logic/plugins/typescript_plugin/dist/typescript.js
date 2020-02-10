"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_compiler_1 = require("./typescript_compiler");
function typescript(args) {
    return async (model, context) => {
        await typescript_compiler_1.compile(model, context);
        return model;
    };
}
exports.typescript = typescript;