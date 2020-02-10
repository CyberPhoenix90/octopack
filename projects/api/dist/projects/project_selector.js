"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getSelectedProjects(selectors, projects, context) {
    if (!selectors.length) {
        return projects;
    }
    else {
        const selectedProjects = [];
        projects.forEach((p) => {
            if (selectors.includes(p.resolvedConfig.name)) {
                selectedProjects.push(p);
            }
        });
        if (selectedProjects.length < selectors.length) {
            const notFoundNames = [];
            const selectedProjectNames = selectedProjects.map((p) => p.resolvedConfig.name);
            selectors.forEach((a) => {
                if (!selectedProjectNames.includes(a)) {
                    notFoundNames.push(a);
                }
            });
            context.uiLogger.warn(`No project(s) with the name(s) ${notFoundNames.join(', ')} could be located. Skipping these arguments.`);
        }
        return selectedProjects;
    }
}
exports.getSelectedProjects = getSelectedProjects;