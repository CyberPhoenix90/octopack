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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHNjb25maWdfbWFwcGluZ19nZW5lcmF0b3IuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0c2NvbmZpZ19tYXBwaW5nX2dlbmVyYXRvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLCtCQUFzQztBQUV0QyxTQUFnQix3QkFBd0IsQ0FBQyxJQUFrQjtJQUMxRCxPQUFPLEtBQUssRUFBRSxRQUFtQixFQUFFLE9BQXNCLEVBQUUsRUFBRTtRQUM1RCxJQUFJLE1BQU0sQ0FBQztRQUNYLElBQUksT0FBTyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBSSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsZUFBZSxDQUFDLENBQUMsRUFBRTtZQUM1RSxNQUFNLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FDbEIsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FDdkYsQ0FBQztTQUNGO2FBQU07WUFDTixNQUFNLEdBQUc7Z0JBQ1IsZUFBZSxFQUFFLEVBQUU7YUFDbkIsQ0FBQztTQUNGO1FBQ0QsTUFBTSxDQUFDLGVBQWUsQ0FBQyxPQUFPLEdBQUcsR0FBRyxDQUFDO1FBQ3JDLE1BQU0sQ0FBQyxlQUFlLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztRQUNsQyxLQUFLLE1BQU0sQ0FBQyxJQUFJLFFBQVEsRUFBRTtZQUN6QixNQUFNLENBQUMsZUFBZSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBUSxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7U0FDaEc7UUFFRCxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUNqQyxXQUFJLENBQUMsT0FBTyxDQUFDLGFBQWEsRUFBRSxlQUFlLENBQUMsRUFDNUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUNwQyxDQUFDO0lBQ0gsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQXZCRCw0REF1QkMifQ==