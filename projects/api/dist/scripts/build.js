"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("../../../business_logic/compiler");
const project_crawler_1 = require("../projects/project_crawler");
const script_1 = require("./script");
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
        const allProjects = await project_crawler_1.projectCrawler.findProjects(context.workspaceRoot, context);
        const selectedProjects = this.getSelectedProjects(args, allProjects, context);
        if (selectedProjects.length) {
            await compiler_1.compiler.compile(selectedProjects, allProjects, context, args);
        }
        else {
            context.uiLogger.error('None of the provided names were matching a project. Not building.');
        }
        return {};
    }
    getSelectedProjects(args, projects, context) {
        if (!args.list.length) {
            return projects;
        }
        else {
            const selectedProjects = [];
            projects.forEach((p) => {
                if (args.list.includes(p.resolvedConfig.name)) {
                    selectedProjects.push(p);
                }
            });
            if (selectedProjects.length < args.list.length) {
                const notFoundNames = [];
                const selectedProjectNames = selectedProjects.map((p) => p.resolvedConfig.name);
                args.list.forEach((a) => {
                    if (!selectedProjectNames.includes(a)) {
                        notFoundNames.push(a);
                    }
                });
                context.uiLogger.warn(`No project(s) with the name(s) ${notFoundNames.join(', ')} could be located. Skipping these arguments.`);
            }
            return selectedProjects;
        }
    }
}
exports.Build = Build;
//# sourceMappingURL=build.js.map