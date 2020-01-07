"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function tsconfigMappingGenerator(args) {
    return async (projects, context) => {
        let config;
        if (context.fileSystem.exists(path_1.join(context.workspaceRoot, 'tsconfig.json'))) {
            config = JSON.parse(await context.fileSystem.readFile(path_1.join(context.workspaceRoot, 'tsconfig.json'), 'utf8'));
        }
        else {
            config = {
                compilerOptions: {}
            };
        }
        config.compilerOptions.baseUrl = '.';
        config.compilerOptions.paths = {};
        for (const p of projects) {
            config.compilerOptions.paths[p.resolvedConfig.name] = [path_1.relative(context.workspaceRoot, p.path)];
        }
        await context.fileSystem.writeFile(path_1.join(context.workspaceRoot, 'tsconfig.json'), JSON.stringify(config, undefined, 4));
    };
}
exports.tsconfigMappingGenerator = tsconfigMappingGenerator;
//# sourceMappingURL=tsconfig_mapping_generator.js.map