"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const project_crawler_1 = require("../projects/project_crawler");
const script_1 = require("./script");
const npm_installer_1 = require("../../../business_logic/plugins/npm_installer");
const compiler_1 = require("../../../business_logic/compiler");
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
        const selectedProjects = this.getSelectedProjects(args, await project_crawler_1.projectCrawler.findProjects(context.workspaceRoot, context), context);
        if (selectedProjects.length) {
            context.uiLogger.info(`Npm installing ${selectedProjects.length} projects...`);
            await npm_installer_1.npmInstallPlugin(selectedProjects);
            await compiler_1.compiler.compile(selectedProjects, context, args);
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