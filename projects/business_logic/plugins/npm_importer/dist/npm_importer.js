"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_analyser_1 = require("static_analyser");
const typescript_1 = require("typescript");
const path_1 = require("path");
const webpack_1 = require("./webpack");
function npmImporter(args) {
    return async (model, context) => {
        if (['node', 'electron'].includes(model.project.resolvedConfig.platform)) {
            return model;
        }
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping npm imports`);
        if (!(await model.fileSystem.exists(path_1.join(model.project.path, 'package.json')))) {
            throw new Error(`Project ${model.project.resolvedConfig.name} is missing a package.json`);
        }
        const packageJson = JSON.parse(await model.fileSystem.readFile(path_1.join(model.project.path, 'package.json'), 'utf8'));
        const toLoad = new Set();
        for (const file of model.input) {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                await findDependencies(file, model, packageJson, toLoad);
            }
        }
        for (const name of toLoad) {
            await loadPackage(model, name);
        }
        return model;
    };
}
exports.npmImporter = npmImporter;
async function findDependencies(file, model, packageJson, toLoad) {
    const fm = new static_analyser_1.FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
    fm.queryAst((node) => {
        if (typescript_1.isImportDeclaration(node)) {
            if (node.moduleSpecifier) {
                const moduleName = node.moduleSpecifier.text;
                if (!moduleName.startsWith('.')) {
                    const [name] = moduleName.split('/');
                    const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
                    if (!target) {
                        if (packageJson.dependencies[name]) {
                            toLoad.add(name);
                        }
                    }
                }
            }
            return [];
        }
        else {
            return [];
        }
    });
}
async function loadPackage(model, pkg) {
    const result = await webpack_1.webpack.createBundle(model.fileSystem, {
        moduleName: pkg,
        externals: {},
        mode: 'production',
        entry: path_1.join(model.project.path, 'node_modules', pkg)
    });
    await model.fileSystem.mkdirp(path_1.join(model.project.path, 'build_assets', pkg));
    await model.fileSystem.writeFile(path_1.join(model.project.path, 'build_assets', pkg, 'bundle.js'), result);
    model.project.fileDependencies.set(pkg, path_1.join('build_assets', pkg, 'bundle.js'));
}