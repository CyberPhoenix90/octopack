"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_analyser_1 = require("static_analyser");
const path_1 = require("path");
function barrelFile(args) {
    return async (model, context) => {
        if (model.project.resolvedConfig.assembly === 'executable') {
            return model;
        }
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Generating barrel file`);
        const optMode = args.optMode;
        if (optMode !== 'in' && optMode !== 'out') {
            context.uiLogger.error(`Expected 'in' or 'out' as optMode but got ${optMode} instead. Not generating barrel file.`);
            return model;
        }
        const pragma = args.pragma;
        if (typeof pragma !== 'string') {
            context.uiLogger.error(`Expected string for pragma but received ${pragma} instead. Not generating barrel file.`);
            return model;
        }
        const fromProjectToBarrelFile = args.output;
        const barrelFileContent = [];
        const pathToBarrelFile = path_1.join(model.project.path, fromProjectToBarrelFile);
        const pathToBarrelFileFolder = path_1.parse(pathToBarrelFile).dir;
        for (const file of model.input) {
            if (file === pathToBarrelFile) {
                continue;
            }
            let includesPragma = false;
            new static_analyser_1.FileManipulator(await model.fileSystem.readFile(file, 'utf8')).forEachComment((c) => {
                if (c.includes(pragma)) {
                    includesPragma = true;
                }
                return undefined;
            });
            if ((['.ts', '.tsx', '.js', '.jsx'].some((c) => file.endsWith(c)) && optMode === 'in' && includesPragma) ||
                (optMode === 'out' && !includesPragma)) {
                const parsedExportPath = path_1.parse(path_1.relative(pathToBarrelFileFolder, file));
                let exportPath = path_1.join(parsedExportPath.dir, parsedExportPath.name);
                if (!exportPath.startsWith(`.${path_1.sep}`)) {
                    exportPath = `.${path_1.sep}${exportPath}`;
                }
                barrelFileContent.push(`export * from '${exportPath}';\n`);
            }
        }
        if (barrelFileContent.length) {
            await model.fileSystem.writeFile(pathToBarrelFile, barrelFileContent.sort().join(''));
        }
        return model;
    };
}
exports.barrelFile = barrelFile;