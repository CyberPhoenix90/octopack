"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function inputPhase(projects, context) {
    const inputPhaseResult = {
        projectsWithInput: []
    };
    for (const p of projects) {
        const entry = {
            project: p.project,
            bundle: p.bundle,
            files: []
        };
        for (const pattern of p.project.resolvedConfig.build.bundles.dist.input) {
            const matches = await context.fileSystem.glob(p.project.path, pattern);
            entry.files.push(...(await Promise.all(matches.map((p) => context.fileSystem.toVirtualFile(p)))));
        }
        inputPhaseResult.projectsWithInput.push(entry);
    }
    return inputPhaseResult;
}
exports.inputPhase = inputPhase;
//# sourceMappingURL=input.js.map