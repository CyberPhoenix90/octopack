"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = require("./phases/input");
const plugin_phase_1 = require("./phases/plugin_phase");
const output_1 = require("./phases/output");
class Compiler {
    async compile(selectedProjects, allProjects, context, args) {
        let compileModel = {
            projectsBuildData: selectedProjects.map((p) => ({
                bundle: this.getBundle(p, args),
                projectDependencies: new Set(),
                allProjects,
                selectedProjects,
                project: p,
                files: [],
                outFiles: {}
            }))
        };
        compileModel = await plugin_phase_1.pluginBasedPhase('init', compileModel, context);
        compileModel = await input_1.inputPhase(compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('link', compileModel, context);
        this.sortByDependencies(compileModel);
        compileModel = await plugin_phase_1.pluginBasedPhase('preProcess', compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('compile', compileModel, context);
        compileModel = await output_1.outputPhase(compileModel, context);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDBDQUE0QztBQUM1Qyx3REFBeUQ7QUFDekQsNENBQThDO0FBRTlDLE1BQWEsUUFBUTtJQUNiLEtBQUssQ0FBQyxPQUFPLENBQ25CLGdCQUEyQixFQUMzQixXQUFzQixFQUN0QixPQUFzQixFQUN0QixJQUFxQjtRQUVyQixJQUFJLFlBQVksR0FBa0I7WUFDakMsaUJBQWlCLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxDQUFtQixDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztnQkFDakUsTUFBTSxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztnQkFDL0IsbUJBQW1CLEVBQUUsSUFBSSxHQUFHLEVBQUU7Z0JBQzlCLFdBQVc7Z0JBQ1gsZ0JBQWdCO2dCQUNoQixPQUFPLEVBQUUsQ0FBQztnQkFDVixLQUFLLEVBQUUsRUFBRTtnQkFDVCxRQUFRLEVBQUUsRUFBRTthQUNaLENBQUMsQ0FBQztTQUNILENBQUM7UUFFRixZQUFZLEdBQUcsTUFBTSwrQkFBZ0IsQ0FBQyxNQUFNLEVBQUUsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3JFLFlBQVksR0FBRyxNQUFNLGtCQUFVLENBQUMsWUFBWSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3ZELFlBQVksR0FBRyxNQUFNLCtCQUFnQixDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFckUsSUFBSSxDQUFDLGtCQUFrQixDQUFDLFlBQVksQ0FBQyxDQUFDO1FBRXRDLFlBQVksR0FBRyxNQUFNLCtCQUFnQixDQUFDLFlBQVksRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDM0UsWUFBWSxHQUFHLE1BQU0sK0JBQWdCLENBQUMsU0FBUyxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUN4RSxZ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