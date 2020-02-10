"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("compiler");
const project_crawler_1 = require("../projects/project_crawler");
const project_selector_1 = require("../projects/project_selector");
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
        const selectedProjects = project_selector_1.getSelectedProjects(args.list, allProjects, context);
        if (selectedProjects.length) {
            await compiler_1.compiler.compile(selectedProjects, allProjects, context, args);
        }
        else {
            context.uiLogger.error('None of the provided names were matching a project. Not building.');
        }
        return {};
    }
}
exports.Build = Build;