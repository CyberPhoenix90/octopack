"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function bundle(args) {
    return async (model, context) => {
        if (['browser', 'electron'].includes(model.project.resolvedConfig.platform)) {
            throw new Error('Browser and electron are not supported yet by bundle plugin');
        }
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Creating bundle`);
        const outputDir = path_1.join(model.project.path, model.project.resolvedConfig.build.bundles[model.bundle].output);
        for (const file of model.output) {
            if (!file.endsWith('.js')) {
                continue;
            }
            if (file.startsWith(outputDir)) {
                model.project.virtualFileImports.set(path_1.relative(outputDir, file), await model.fileSystem.readFile(file, 'utf8'));
            }
            else {
                model.project.virtualFileImports.set(path_1.relative(model.project.path, file), await model.fileSystem.readFile(file, 'utf8'));
            }
        }
        return model;
    };
}
exports.bundle = bundle;