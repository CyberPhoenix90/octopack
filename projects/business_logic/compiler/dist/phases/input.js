"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
async function inputPhase(model, context) {
    for (const p of model.projectsBuildData) {
        for (const pattern of p.project.resolvedConfig.build.bundles.dist.input) {
            const matches = await context.fileSystem.glob(p.project.path, pattern);
            p.input.push(...matches);
        }
    }
    return model;
}
exports.inputPhase = inputPhase;