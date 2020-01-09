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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR5cGVzY3JpcHQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwrREFBZ0Q7QUFFaEQsU0FBZ0IsVUFBVSxDQUFDLElBQWtCO0lBQzVDLE9BQU8sS0FBSyxFQUFFLEtBQXVCLEVBQUUsT0FBc0IsRUFBRSxFQUFFO1FBQ2hFLE1BQU0sNkJBQU8sQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDOUIsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSCxDQUFDO0FBTEQsZ0NBS0MifQ==