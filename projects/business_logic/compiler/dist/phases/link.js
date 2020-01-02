"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function link(input, context) {
    for (const projectWithInput of input.projectsWithInput) {
        console.log(projectWithInput.project.resolvedConfig.build.bundles[projectWithInput.bundle].compilation.link);
    }
    throw new Error('not implemented');
}
exports.link = link;
//# sourceMappingURL=link.js.map