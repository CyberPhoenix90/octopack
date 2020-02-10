"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("file_system");
const input_1 = require("./phases/input");
const plugin_phase_1 = require("./phases/plugin_phase");
const config_resolver_1 = require("config_resolver");
class Compiler {
    async compile(selectedProjects, allProjects, context, args) {
        let compileModel = {
            projectsBuildData: selectedProjects.map((p) => {
                const mlfs = new file_system_1.FileSystemMutationLogger(new file_system_1.MemoryFileSystem());
                const fs = new file_system_1.CachedFileSystem(context.fileSystem, mlfs);
                const bundle = config_resolver_1.getBundle(p.resolvedConfig, args.map);
                if (!bundle) {
                    throw new Error(`No bundle could be determined for project ${p} please define a default or state the bundle to be used with a CLI flag`);
                }
                return {
                    flags: args.map,
                    bundle,
                    allProjects,
                    selectedProjects,
                    project: p,
                    input: [],
                    get output() {
                        return Array.from(mlfs.writtenFiles);
                    },
                    fileSystem: fs
                };
            })
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
                if (this.hasAll(compileModel.projectsBuildData[i].project.projectDependencies, selectedProjects, order)) {
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
}
exports.Compiler = Compiler;
exports.compiler = new Compiler();