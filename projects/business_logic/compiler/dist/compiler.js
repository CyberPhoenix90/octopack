"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = require("./phases/input");
const plugin_phase_1 = require("./phases/plugin_phase");
class Compiler {
    async compile(selectedProjects, allProjects, context, args) {
        let compileModel = {
            projectsBuildData: selectedProjects.map((p) => ({
                bundle: this.getBundle(p, args),
                projectDependencies: new Set(),
                allProjects,
                project: p,
                files: []
            }))
        };
        compileModel = await plugin_phase_1.pluginBasedPhase('init', compileModel, context);
        compileModel = await input_1.inputPhase(compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('link', compileModel, context);
        this.sortByDependencies(compileModel);
        compileModel = await plugin_phase_1.pluginBasedPhase('preProcess', compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('compile', compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('emit', compileModel, context);
    }
    sortByDependencies(compileModel) {
        const order = [];
        while (compileModel.projectsBuildData.length > 0) {
            let circle = true;
            for (let i = compileModel.projectsBuildData.length - 1; i >= 0; i--) {
                if (this.hasAll(compileModel.projectsBuildData[i].projectDependencies, order)) {
                    order.push(compileModel.projectsBuildData[i]);
                    compileModel.projectsBuildData.splice(i, 1);
                    circle = false;
                }
            }
            if (circle) {
                throw new Error('Circular dependency in project dependencies');
            }
        }
        compileModel.projectsBuildData = order;
    }
    hasAll(projectDependencies, order) {
        for (const p of projectDependencies) {
            let has = false;
            for (const o of order) {
                if (o.project === p) {
                    has = true;
                    break;
                }
            }
            if (!has) {
                return false;
            }
        }
        return true;
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