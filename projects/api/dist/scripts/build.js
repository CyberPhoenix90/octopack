"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const project_crawler_1 = require("../projects/project_crawler");
const script_1 = require("./script");
const npm_installer_1 = require("../../../business_logic/plugins/npm_installer");
const typescript_1 = require("../../../business_logic/plugins/typescript");
class Build extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Builds stuff'
        };
    }
    async run(args, context) {
        const projects = await project_crawler_1.projectCrawler.findProjects(context.workspaceRoot, context.fileSystem);
        context.uiLogger.info(`Npm installing ${projects.length} projects...`);
        await npm_installer_1.npmInstallPlugin(projects);
        context.uiLogger.info(`Building ${projects.length} projects...`);
        await typescript_1.typescriptPlugin(projects);
        return {};
    }
}
exports.Build = Build;
//# sourceMappingURL=build.js.map