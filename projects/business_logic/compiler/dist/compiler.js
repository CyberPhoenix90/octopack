"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
class Compiler {
    async compile(projects, context) {
        const projectsWithInput = await this.inputPhase(projects, context);
        console.log(util_1.inspect(projectsWithInput, false, 4));
    }
    async inputPhase(projects, context) {
        const inputPhaseResult = {
            projectsWithInput: []
        };
        for (const p of projects) {
            const entry = {
                project: p,
                files: []
            };
            for (const pattern of p.resoledConfig.build.bundles.dist.input) {
                const matches = await context.fileSystem.glob(p.path, pattern);
                entry.files.push(...(await Promise.all(matches.map((p) => context.fileSystem.toVirtualFile(p)))));
            }
            inputPhaseResult.projectsWithInput.push(entry);
        }
        return inputPhaseResult;
    }
}
exports.Compiler = Compiler;
exports.compiler = new Compiler();
//# sourceMappingURL=compiler.js.map