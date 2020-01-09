"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const config_resolver_1 = require("../../../business_logic/config_resolver");
class ProjectCrawler {
    async findProjects(root, context) {
        const result = [];
        await this.searchDirectory(result, root, context);
        return result;
    }
    async searchDirectory(result, path, context) {
        if (await context.fileSystem.exists(path_1.join(path, config_resolver_1.OCTOPACK_CONFIG_FILE_NAME))) {
            const config = await config_resolver_1.loadConfig(path, context.fileSystem);
            if (config.scope === 'project') {
                result.push({
                    path,
                    rawConfig: config,
                    resolvedConfig: config_resolver_1.resolveConfig({
                        project: config,
                        workspace: context.workspaceConfig
                    })
                });
            }
            else {
                await this.crawSubfolders(context, path, result);
            }
        }
        else {
            await this.crawSubfolders(context, path, result);
        }
    }
    async crawSubfolders(context, path, result) {
        const directories = await context.fileSystem.getSubfolders(path);
        for (const dir of directories) {
            await this.searchDirectory(result, dir, context);
        }
    }
}
exports.ProjectCrawler = ProjectCrawler;
exports.projectCrawler = new ProjectCrawler();
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdF9jcmF3bGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJvamVjdF9jcmF3bGVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQTRCO0FBQzVCLDZFQUErRztBQUcvRyxNQUFhLGNBQWM7SUFDbkIsS0FBSyxDQUFDLFlBQVksQ0FBQyxJQUFZLEVBQUUsT0FBc0I7UUFDN0QsTUFBTSxNQUFNLEdBQWMsRUFBRSxDQUFDO1FBQzdCLE1BQU0sSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEVBQUUsSUFBSSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBRWxELE9BQU8sTUFBTSxDQUFDO0lBQ2YsQ0FBQztJQUVNLEtBQUssQ0FBQyxlQUFlLENBQUMsTUFBaUIsRUFBRSxJQUFZLEVBQUUsT0FBc0I7UUFDbkYsSUFBSSxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsMkNBQXlCLENBQUMsQ0FBQyxFQUFFO1lBQzNFLE1BQU0sTUFBTSxHQUFHLE1BQU0sNEJBQVUsQ0FBQyxJQUFJLEVBQUUsT0FBTyxDQUFDLFVBQVUsQ0FBQyxDQUFDO1lBQzFELElBQUksTUFBTSxDQUFDLEtBQUssS0FBSyxTQUFTLEVBQUU7Z0JBQy9CLE1BQU0sQ0FBQyxJQUFJLENBQUM7b0JBQ1gsSUFBSTtvQkFDSixTQUFTLEVBQUUsTUFBTTtvQkFDakIsY0FBYyxFQUFFLCtCQUFhLENBQUM7d0JBQzdCLE9BQU8sRUFBRSxNQUFNO3dCQUNmLFNBQVMsRUFBRSxPQUFPLENBQUMsZUFBZTtxQkFDbEMsQ0FBQztpQkFDRixDQUFDLENBQUM7YUFDSDtpQkFBTTtnQkFDTixNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQzthQUNqRDtTQUNEO2FBQU07WUFDTixNQUFNLElBQUksQ0FBQyxjQUFjLENBQUMsT0FBTyxFQUFFLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQztTQUNqRDtJQUNGLENBQUM7SUFFTyxLQUFLLENBQUMsY0FBYyxDQUFDLE9BQXNCLEVBQUUsSUFBWSxFQUFFLE1BQWlCO1FBQ25GLE1BQU0sV0FBVyxHQUFHLE1BQU0sT0FBTyxDQUFDLFVBQVUsQ0FBQyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDakUsS0FBSyxNQUFNLEdBQUcsSUFBSSxXQUFXLEVBQUU7WUFDOUIsTUFBTSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUM7U0FDakQ7SUFDRixDQUFDO0NBQ0Q7QUFsQ0Qsd0NBa0NDO0FBRVksUUFBQSxjQUFjLEdBQW1CLElBQUksY0FBYyxFQUFFLENBQUMifQ==