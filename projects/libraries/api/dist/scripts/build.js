"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const script_1 = require("./script");
const project_crawler_1 = require("../projects/project_crawler");
const child_process_1 = require("child_process");
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
        console.log(`Building ${projects.length} projects...`);
        const promises = [];
        for (const project of projects) {
            this.buildProject(project);
        }
        await Promise.all(promises);
        return {};
    }
    buildProject(project) {
        return new Promise((resolve, reject) => {
            const handle = child_process_1.spawn('tsc', {
                cwd: project.path
            });
            handle.on('error', (err) => {
                reject(err);
            });
            handle.on('close', () => {
                resolve();
            });
            handle.on('exit', () => {
                resolve();
            });
        });
    }
}
exports.Build = Build;
//# sourceMappingURL=build.js.map