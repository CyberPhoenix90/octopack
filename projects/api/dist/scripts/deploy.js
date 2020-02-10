"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const project_crawler_1 = require("../projects/project_crawler");
const script_1 = require("./script");
const project_selector_1 = require("../projects/project_selector");
const build_1 = require("./build");
const config_resolver_1 = require("config_resolver");
const path_1 = require("path");
const child_process_1 = require("child_process");
class Deploy extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Deploys stuff'
        };
    }
    async run(args, context) {
        const allProjects = await project_crawler_1.projectCrawler.findProjects(context.workspaceRoot, context);
        const selectedProjects = project_selector_1.getSelectedProjects(args.list, allProjects, context).filter((p) => p.resolvedConfig.deploy);
        if (selectedProjects.length) {
            for (const project of selectedProjects) {
                const deployDir = path_1.join(project.path, project.resolvedConfig.deploy.deployDir);
                await new build_1.Build().run({
                    list: [project.resolvedConfig.name],
                    map: {
                        ...args.map,
                        remapImportSource: '../internal_dependencies'
                    },
                    raw: args.raw
                }, context);
                const bundle = config_resolver_1.getBundle(project.resolvedConfig, args.map);
                if (!bundle) {
                    throw new Error(`No bundle could be determined for project ${project} please define a default or state the bundle to be used with a CLI flag`);
                }
                const config = project.resolvedConfig.build.bundles[bundle];
                const outDir = path_1.join(project.path, config.output);
                if (await context.fileSystem.exists(deployDir)) {
                    await context.fileSystem.deleteDirectory(deployDir);
                }
                await context.fileSystem.copyDirectory(outDir, path_1.join(deployDir, 'dist'));
                await context.fileSystem.copyFile(path_1.join(project.path, 'package.json'), path_1.join(deployDir, 'package.json'));
                await context.fileSystem.mkdir(path_1.join(deployDir, 'internal_dependencies'));
                for (const dep of project.projectDependencies.values()) {
                    await this.prepareDependency(dep, args, deployDir, context);
                }
                await install(deployDir);
            }
        }
        else {
            context.uiLogger.error('Nothing found that can be deployed');
        }
        return {};
    }
    async prepareDependency(dep, args, deployDir, context) {
        const target = path_1.join(deployDir, 'internal_dependencies', dep.resolvedConfig.name);
        if (await context.fileSystem.exists(target)) {
            return;
        }
        await new build_1.Build().run({
            list: [dep.resolvedConfig.name],
            map: {
                ...args.map,
                remapImportSource: '../../'
            },
            raw: args.raw
        }, context);
        await context.fileSystem.mkdir(target);
        const depBundle = config_resolver_1.getBundle(dep.resolvedConfig, args.map);
        const depConfig = dep.resolvedConfig.build.bundles[depBundle];
        const depOutDir = path_1.join(dep.path, depConfig.output);
        await context.fileSystem.copyFile(path_1.join(dep.path, 'package.json'), path_1.join(target, 'package.json'));
        await context.fileSystem.copyDirectory(depOutDir, path_1.join(target, 'dist'));
        await install(target);
        for (const subDep of dep.projectDependencies.values()) {
            await this.prepareDependency(subDep, args, deployDir, context);
        }
    }
}
exports.Deploy = Deploy;
async function install(path, isRetry = false) {
    await runCommand('npm', ['install']);
    await runCommand('npm', ['install', '--package-lock-only']);
    function runCommand(cli, args) {
        return new Promise((resolve, reject) => {
            const handle = child_process_1.spawn(cli, args, {
                cwd: path
            });
            const stdBuffer = [];
            handle.stdout.on('data', (msg) => {
                stdBuffer.push(msg);
            });
            handle.stderr.on('data', (msg) => {
                stdBuffer.push(msg);
            });
            handle.on('error', (err) => {
                reject(err);
            });
            handle.on('close', () => {
                resolve();
            });
            handle.on('exit', (code) => {
                if (code !== 0) {
                    if (isRetry) {
                        console.error(stdBuffer.join(''));
                        reject(code);
                    }
                    else {
                        install(path, true).then(resolve, reject);
                    }
                }
                else {
                    resolve();
                }
            });
        });
    }
}