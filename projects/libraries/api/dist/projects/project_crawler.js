"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const dist_1 = require("../../../config_resolver/dist");
const path_1 = require("path");
class ProjectCrawler {
    async findProjects(root, fileSystem) {
        const result = [];
        await this.searchDirectory(result, root, fileSystem);
        return result;
    }
    async searchDirectory(result, path, fileSystem) {
        if (await fileSystem.exists(path_1.join(path, dist_1.OCTOPACK_CONFIG_FILE_NAME))) {
            const config = await dist_1.loadConfig(path, fileSystem);
            if (config.scope === 'project') {
                result.push({
                    path,
                    rawConfig: config
                });
            }
            else {
                await this.crawSubfolders(fileSystem, path, result);
            }
        }
        else {
            await this.crawSubfolders(fileSystem, path, result);
        }
    }
    async crawSubfolders(fileSystem, path, result) {
        const directories = await fileSystem.getSubfolders(path);
        for (const dir of directories) {
            await this.searchDirectory(result, dir, fileSystem);
        }
    }
}
exports.ProjectCrawler = ProjectCrawler;
exports.projectCrawler = new ProjectCrawler();
//# sourceMappingURL=project_crawler.js.map