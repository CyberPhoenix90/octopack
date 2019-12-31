"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const script_1 = require("./script");
const project_crawler_1 = require("../projects/project_crawler");
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
        console.log(projects);
        return {};
    }
}
exports.Build = Build;
//# sourceMappingURL=build.js.map