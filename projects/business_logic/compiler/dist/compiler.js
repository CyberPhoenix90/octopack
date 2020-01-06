"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = require("./phases/input");
const plugin_phase_1 = require("./phases/plugin_phase");
class Compiler {
    async compile(projects, context, args) {
        let compileModel = {
            projectsBuildData: projects.map((p) => ({
                bundle: this.getBundle(p, args),
                project: p,
                files: []
            }))
        };
        compileModel = await plugin_phase_1.pluginBasedPhase('init', compileModel, context);
        compileModel = await input_1.inputPhase(compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('link', compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('compile', compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('emit', compileModel, context);
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