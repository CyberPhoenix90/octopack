"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'config_resolver': '../../config_resolver', 'models': '../../models', 'npm_installer': '../../plugins/npm_installer', 'project_importer': '../../plugins/project_importer', 'typescript_plugin': '../../plugins/typescript_plugin', 'meta_programming': '../../plugins/meta_programming', 'barrel_file': '../../plugins/barrel_file', 'output_plugin': '../../plugins/output_plugin', 'runtime': '../../plugins/runtime', 'tsconfig_mapping_generator': '../../plugins/tsconfig_mapping_generator' };
const mod = require('module');
const original = mod.prototype.require;
mod.prototype.require = function (path, ...args) {
    if (importData[path]) {
        path = importData[path];
        return original.call(module, path, ...args);
    }
    else {
        return original.call(this, path, ...args);
    }
};
__export(require("./build_plugin_loader"));
__export(require("./generator_plugin_loader"));
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxjQUFjLHVCQUF1QixDQUFDO0FBQ3RDLGNBQWMsMkJBQTJCLENBQUMifQ==
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJpbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUNBLE1BQU0sVUFBVSxHQUFHLEVBQUMsaUJBQWlCLEVBQUUsdUJBQXVCLEVBQUMsUUFBUSxFQUFFLGNBQWMsRUFBQyxlQUFlLEVBQUUsNkJBQTZCLEVBQUMsa0JBQWtCLEVBQUUsZ0NBQWdDLEVBQUMsbUJBQW1CLEVBQUUsaUNBQWlDLEVBQUMsa0JBQWtCLEVBQUUsZ0NBQWdDLEVBQUMsYUFBYSxFQUFFLDJCQUEyQixFQUFDLGVBQWUsRUFBRSw2QkFBNkIsRUFBQyxTQUFTLEVBQUUsdUJBQXVCLEVBQUMsNEJBQTRCLEVBQUUsMENBQTBDLEVBQUMsQ0FBQTtBQUM5ZSxNQUFNLEdBQUcsR0FBRyxPQUFPLENBQUMsUUFBUSxDQUFDLENBQUM7QUFFOUIsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLENBQUM7QUFDdkMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxPQUFPLEdBQUcsVUFBUyxJQUFJLEVBQUUsR0FBRyxJQUFJO0lBQzdDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1FBQ3JCLElBQUksR0FBRyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDeEIsT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUM1QztTQUFNO1FBQ04sT0FBTyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztLQUMxQztBQUNGLENBQUMsQ0FBQztBQUVGLDJDQUFzQztBQUN0QywrQ0FBMEM7QUFDMUMsOE9BQThPIn0=