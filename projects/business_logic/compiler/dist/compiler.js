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
        compileModel = await plugin_phase_1.pluginBasedChainedPhase(['compile', { name: 'output', defaultPlugins: ['output'] }], compileModel, context);
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjb21waWxlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDBDQUE0QztBQUM1Qyx3REFBa0Y7QUFFbEYsTUFBYSxRQUFRO0lBQ2IsS0FBSyxDQUFDLE9BQU8sQ0FDbkIsZ0JBQTJCLEVBQzNCLFdBQXNCLEVBQ3RCLE9BQXNCLEVBQ3RCLElBQXFCO1FBRXJCLElBQUksWUFBWSxHQUFrQjtZQUNqQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQW1CLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO2dCQUMvQixtQkFBbUIsRUFBRSxJQUFJLEdBQUcsRUFBRTtnQkFDOUIsV0FBVztnQkFDWCxnQkFBZ0I7Z0JBQ2hCLE9BQU8sRUFBRSxDQUFDO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULFFBQVEsRUFBRSxFQUFFO2FBQ1osQ0FBQyxDQUFDO1NBQ0gsQ0FBQztRQUVGLFlBQVksR0FBRyxNQUFNLCtCQUFnQixDQUFDLE1BQU0sRUFBRSxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckUsWUFBWSxHQUFHLE1BQU0sa0JBQVUsQ0FBQyxZQUFZLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDdkQsWUFBWSxHQUFHLE1BQU0sK0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUVyRSxJQUFJLENBQUMsa0JBQWtCLENBQUMsWUFBWSxDQUFDLENBQUM7UUFFdEMsWUFBWSxHQUFHLE1BQU0sK0JBQWdCLENBQUMsWUFBWSxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztRQUMzRSxZQUFZLEdBQUcsTUFBTSxzQ0FBdUIsQ0FDM0MsQ0FBQyxTQUFTLEVBQUUsRUFBRSxJQUFJLEVBQUUsUUFBUSxFQUFFLGNBQWMsRUFBRSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsRUFDM0QsWUFBWSxFQUNaLE9BQU8sQ0FDUCxDQUFDO1FBQ0YsWUFBWSxHQUFHLE1BQU0sK0JBQWdCLENBQUMsTUFBTSxFQUFFLFlBQVksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUN0RSxDQUFDO0lBRU8sa0JBQWtCLENBQUMsWUFBMkI7UUFDckQsTUFBTSxLQUFLLEdBQXVCLEVBQUUsQ0FBQztRQUNyQyxPQUFPLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFO1lBQ2pELElBQUksTUFBTSxHQUFHLElBQUksQ0FBQztZQUVsQixLQUFLLElBQUksQ0FBQyxHQUFHLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUU7Z0JBQ3BFLElBQUksSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDLENBQUMsbUJBQW1CLEVBQUUsS0FBSyxDQUFDLEVBQUU7b0JBQzlFLEtBQUssQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlDLFlBQVksQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO29CQUM1QyxNQUFNLEdBQUcsS0FBSyxDQUFDO2lCQUNmO2FBQ0Q7WUFFRCxJQUFJLE1BQU0sRUFBRTtnQkFDWCxNQUFNLElBQUksS0FBSyxDQUFDLDZDQUE2QyxDQUFDLENBQUM7YUFDL0Q7U0FDRDtRQUNELFlBQVksQ0FBQyxpQkFBaUIsR0FBRyxLQUFLLENBQUM7SUFDeEMsQ0FBQztJQUVPLE1BQU0sQ0FBQyxtQkFBaUMsRUFBRSxLQUF5QjtRQUMxRSxLQUFLLE1BQU0sQ0FBQyxJQUFJLG1CQUFtQixFQUFFO1lBQ3BDLElBQUksR0FBRyxHQUFHLEtBQUssQ0FBQztZQUNoQixLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssRUFBRTtnQkFDdEIsSUFBSSxDQUFDLENBQUMsT0FBTyxLQUFLLENBQUMsRUFBRTtvQkFDcEIsR0FBRyxHQUFHLElBQUksQ0FBQztvQkFDWCxNQUFNO2lCQUNOO2FBQ0Q7WUFDRCxJQUFJLENBQUMsR0FBRyxFQUFFO2dCQUNULE9BQU8sS0FBSyxDQUFDO2FBQ2I7U0FDRDtRQUVELE9BQU8sSUFBSSxDQUFDO0lBQ2IsQ0FBQztJQUVPLFNBQVMsQ0FBQyxPQUFnQixFQUFFLElBQXFCO1FBQ3hELE1BQU0sT0FBTyxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7UUFDbEUsSUFBSSxhQUFhLENBQUM7UUFDbEIsS0FBSyxNQUFNLE1BQU0sSUFBSSxPQUFPLEVBQUU7WUFDN0IsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLElBQUksRUFBRTtnQkFDOUIsT0FBTyxNQUFNLENBQUM7YUFDZDtZQUNELElBQUksT0FBTyxDQUFDLGNBQWMsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE9BQU8sRUFBRTtnQkFDekQsYUFBYSxHQUFHLE1BQU0sQ0FBQzthQUN2QjtTQUNEO1FBRUQsSUFBSSxhQUFhLEVBQUU7WUFDbEIsT0FBTyxhQUFhLENBQUM7U0FDckI7YUFBTSxJQUFJLE9BQU8sQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO1lBQ2hDLE9BQU8sT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO2FBQU07WUFDTixNQUFNLElBQUksS0FBSyxDQUNkLDZDQUE2QyxPQUFPLHlFQUF5RSxDQUM3SCxDQUFDO1NBQ0Y7SUFDRixDQUFDO0NBQ0Q7QUE3RkQsNEJBNkZDO0FBRVksUUFBQSxRQUFRLEdBQWEsSUFBSSxRQUFRLEVBQUUsQ0FBQyJ9