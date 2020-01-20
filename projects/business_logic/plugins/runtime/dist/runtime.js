"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function runtime(args) {
    return async (model, context) => {
        var _a, _b, _c;
        let path = path_1.join(model.project.path, args.out);
        let handleExisting = (_a = args.handleExisting, (_a !== null && _a !== void 0 ? _a : 'replace'));
        let runtime = `${_b = args.header, (_b !== null && _b !== void 0 ? _b : '')}`;
        if (model.projectDependencies.size) {
            runtime += `
${createImportMap(model, path)}
const mod = require('module');

const original = mod.prototype.require;
mod.prototype.require = function(path, ...args) {
	if (importData[path]) {
		path = importData[path];
		return original.call(module, path, ...args);
	} else {
		return original.call(this, path, ...args);
	}
};
`;
        }
        runtime += `${_c = args.footer, (_c !== null && _c !== void 0 ? _c : '')}`;
        if (await model.fileSystem.exists(path)) {
            let existing;
            switch (handleExisting) {
                case 'append':
                    existing = await model.fileSystem.readFile(path, 'utf8');
                    await model.fileSystem.writeFile(path, `${existing}\n${runtime}`);
                    break;
                case 'replace':
                    await model.fileSystem.writeFile(path, runtime);
                    break;
                case 'prepend':
                    existing = await model.fileSystem.readFile(path, 'utf8');
                    await model.fileSystem.writeFile(path, `${runtime}\n${existing}`);
                    break;
            }
        }
        else {
            await model.fileSystem.writeFile(path, runtime);
        }
        return model;
    };
}
exports.runtime = runtime;
function createImportMap(model, path) {
    const result = [];
    for (const dep of model.projectDependencies) {
        result.push(`'${dep.resolvedConfig.name}': '${path_1.relative(path_1.parse(path).dir, dep.path)}'`);
    }
    return `const importData = {${result.join(',')}}`;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicnVudGltZS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9ydW50aW1lLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0JBQTZDO0FBRTdDLFNBQWdCLE9BQU8sQ0FBQyxJQUFrQjtJQUN6QyxPQUFPLEtBQUssRUFBRSxLQUF1QixFQUFFLE9BQXNCLEVBQUUsRUFBRTs7UUFDaEUsSUFBSSxJQUFJLEdBQVcsV0FBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN0RCxJQUFJLGNBQWMsU0FBcUMsSUFBSSxDQUFDLGNBQWMsdUNBQUksU0FBUyxFQUFBLENBQUM7UUFFeEYsSUFBSSxPQUFPLEdBQVcsR0FBRyxLQUFBLElBQUksQ0FBQyxNQUFNLHVDQUFJLEVBQUUsQ0FBQSxFQUFFLENBQUM7UUFDN0MsSUFBSSxLQUFLLENBQUMsbUJBQW1CLENBQUMsSUFBSSxFQUFFO1lBQ25DLE9BQU8sSUFBSTtFQUNaLGVBQWUsQ0FBQyxLQUFLLEVBQUUsSUFBSSxDQUFDOzs7Ozs7Ozs7Ozs7Q0FZN0IsQ0FBQztTQUNDO1FBQ0QsT0FBTyxJQUFJLEdBQUcsS0FBQSxJQUFJLENBQUMsTUFBTSx1Q0FBSSxFQUFFLENBQUEsRUFBRSxDQUFDO1FBRWxDLElBQUksTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUN4QyxJQUFJLFFBQWdCLENBQUM7WUFDckIsUUFBUSxjQUFjLEVBQUU7Z0JBQ3ZCLEtBQUssUUFBUTtvQkFDWixRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3pELE1BQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsUUFBUSxLQUFLLE9BQU8sRUFBRSxDQUFDLENBQUM7b0JBQ2xFLE1BQU07Z0JBQ1AsS0FBSyxTQUFTO29CQUNiLE1BQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO29CQUNoRCxNQUFNO2dCQUNQLEtBQUssU0FBUztvQkFDYixRQUFRLEdBQUcsTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUM7b0JBQ3pELE1BQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLEdBQUcsT0FBTyxLQUFLLFFBQVEsRUFBRSxDQUFDLENBQUM7b0JBQ2xFLE1BQU07YUFDUDtTQUNEO2FBQU07WUFDTixNQUFNLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztTQUNoRDtRQUVELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQTdDRCwwQkE2Q0M7QUFFRCxTQUFTLGVBQWUsQ0FBQyxLQUF1QixFQUFFLElBQVk7SUFDN0QsTUFBTSxNQUFNLEdBQWEsRUFBRSxDQUFDO0lBQzVCLEtBQUssTUFBTSxHQUFHLElBQUksS0FBSyxDQUFDLG1CQUFtQixFQUFFO1FBQzVDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLENBQUMsY0FBYyxDQUFDLElBQUksT0FBTyxlQUFRLENBQUMsWUFBSyxDQUFDLElBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0tBQ3RGO0lBRUQsT0FBTyx1QkFBdUIsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDO0FBQ25ELENBQUMifQ==