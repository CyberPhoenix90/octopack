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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy90eXBlc2NyaXB0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0RBQWdEO0FBRWhELFNBQWdCLFVBQVUsQ0FBQyxJQUFrQjtJQUM1QyxPQUFPLEtBQUssRUFBRSxLQUF1QixFQUFFLE9BQXNCLEVBQUUsRUFBRTtRQUNoRSxNQUFNLDZCQUFPLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQzlCLE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQUxELGdDQUtDIn0=