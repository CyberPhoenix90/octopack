"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const input_1 = require("./phases/input");
const link_1 = require("./phases/link");
class Compiler {
    async compile(projects, context, args) {
        const projectsWithBundle = projects.map((p) => ({ bundle: this.getBundle(p, args), project: p }));
        const projectsWithInput = await input_1.inputPhase(projectsWithBundle, context);
        const linkedProjects = await link_1.link(projectsWithInput, context);
        console.log(util_1.inspect(linkedProjects, false, 4));
    }
    getBundle(project, args) {
        const bundles = Object.keys(project.resolvedConfig.build.bundles);
        let defaultBundle;
        for (const bundle of bundles) {
            if (args.map[bundle] === true) {
                return bundle;
            }
            if (project.resolvedConfig.build.bundles[bundle].default) {
                defaultBundle = bundle;
            }
        }
        if (defaultBundle) {
            return defaultBundle;
        }
        else if (bundles.length === 1) {
            return bundles[0];
        }
        else {
            throw new Error(`No bundle could be determined for project ${project} please define a default or state the bundle to be used with a CLI flag`);
        }
    }
}
exports.Compiler = Compiler;
exports.compiler = new Compiler();
//# sourceMappingURL=compiler.js.map