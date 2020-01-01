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
//# sourceMappingURL=project_crawler.js.map