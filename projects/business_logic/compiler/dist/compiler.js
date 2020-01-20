"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const input_1 = require("./phases/input");
const plugin_phase_1 = require("./phases/plugin_phase");
const file_system_1 = require("file_system");
class Compiler {
    async compile(selectedProjects, allProjects, context, args) {
        const mlfs = new file_system_1.FileSystemMutationLogger(new file_system_1.MemoryFileSystem(), false);
        const fs = new file_system_1.CachedFileSystem(context.fileSystem, mlfs);
        let compileModel = {
            projectsBuildData: selectedProjects.map((p) => ({
                bundle: this.getBundle(p, args),
                projectDependencies: new Set(),
                allProjects,
                selectedProjects,
                project: p,
                input: [],
                get output() {
                    return mlfs.fileSystemMutations
                        .filter((m) => m.operation === file_system_1.FileSystemMutationOperation.WRITE)
                        .map((p) => p.path);
                },
                fileSystem: fs
            }))
        };
        compileModel = await plugin_phase_1.pluginBasedPhase('init', compileModel, context);
        compileModel = await input_1.inputPhase(compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedPhase('link', compileModel, context);
        this.sortByDependencies(compileModel, selectedProjects);
        compileModel = await plugin_phase_1.pluginBasedPhase('preProcess', compileModel, context);
        compileModel = await plugin_phase_1.pluginBasedChainedPhase(['compile', 'postProcess', { name: 'emit', defaultPlugins: ['output'] }], compileModel, context);
    }
    sortByDependencies(compileModel, selectedProjects) {
        const order = [];
        while (compileModel.projectsBuildData.length > 0) {
            let circle = true;
            for (let i = compileModel.projectsBuildData.length - 1; i >= 0; i--) {
                if (this.hasAll(compileModel.projectsBuildData[i].projectDependencies, selectedProjects, order)) {
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
    hasAll(projectDependencies, selectedProjects, order) {
        for (const p of projectDependencies) {
            if (!selectedProjects.includes(p)) {
                continue;
            }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29tcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFFQSwwQ0FBNEM7QUFDNUMsd0RBQWtGO0FBQ2xGLDZDQUF3SDtBQUV4SCxNQUFhLFFBQVE7SUFDYixLQUFLLENBQUMsT0FBTyxDQUNuQixnQkFBMkIsRUFDM0IsV0FBc0IsRUFDdEIsT0FBc0IsRUFDdEIsSUFBcUI7UUFFckIsTUFBTSxJQUFJLEdBQUcsSUFBSSxzQ0FBd0IsQ0FBQyxJQUFJLDhCQUFnQixFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDekUsTUFBTSxFQUFFLEdBQUcsSUFBSSw4QkFBZ0IsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDO1FBRTFELElBQUksWUFBWSxHQUFrQjtZQUNqQyxpQkFBaUIsRUFBRSxnQkFBZ0IsQ0FBQyxHQUFHLENBQW1CLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2dCQUNqRSxNQUFNLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDO2dCQUMvQixtQkFBbUIsRUFBRSxJQUFJLEdBQUcsRUFBRTtnQkFDOUIsV0FBVztnQkFDWCxnQkFBZ0I7Z0JBQ2hCLE9BQU8sRUFBRSxDQUFDO2dCQUNWLEtBQUssRUFBRSxFQUFFO2dCQUNULElBQUksTUFBTTtvQkFDVCxPQUFPLElBQUksQ0FBQyxtQkFBbUI7eUJBQzdCLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVMsS0FBSyx5Q0FBMkIsQ0FBQyxLQUFLLENBQUM7eUJBQ2hFLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUN0QixDQUFDO2dCQUNELFVBQVUsRUFBRSxFQUFFO2FBQ2QsQ0FBQyxDQUFDO1NBQ0gsQ0FBQztRQUVGLFlBQVksR0FBRyxN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