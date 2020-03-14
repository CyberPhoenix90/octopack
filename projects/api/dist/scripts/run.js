"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const script_1 = require("./script");
const project_crawler_1 = require("../projects/project_crawler");
const project_selector_1 = require("../projects/project_selector");
const child_process_1 = require("child_process");
class Run extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Runs stuff'
        };
    }
    async run(args, context) {
        const allProjects = await project_crawler_1.projectCrawler.findProjects(context.workspaceRoot, context);
        const selectedProjects = project_selector_1.getSelectedProjects(args.list, allProjects, context);
        const nodeArgs = [];
        if (args.map.debug || args.map.d) {
            nodeArgs.push('--inspect-brk');
        }
        for (const project of selectedProjects) {
            child_process_1.spawn('node', [...nodeArgs, '.'], {
                stdio: 'inherit',
                cwd: project.path
            });
        }
        return {};
    }
}
exports.Run = Run;