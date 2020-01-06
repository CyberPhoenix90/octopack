"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path_1 = require("path");
const dist_1 = require("../../../../libraries/file_system/dist");
async function compile(model, context) {
    context.uiLogger.info(`[${model.project.resolvedConfig.name}] Compiling...`);
    const system = getSystem(model, context);
    const parsedConfig = parseConfigFile(model.project.path, await context.fileSystem.readFile(path_1.join(model.project.path, 'tsconfig.json'), 'utf8'), system);
    const host = ts.createCompilerHostWorker(parsedConfig.options, undefined, system);
    host.getCurrentDirectory = () => model.project.path;
    const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options, host);
    const result = ts.emitFilesAndReportErrors(program, log(model, context), (s) => {
        return ts.sys.write(s + ts.sys.newLine);
    });
    return result;
}
exports.compile = compile;
function log(model, context) {
    return (diagnostic) => {
        if (diagnostic.file) {
            const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
            const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
            console.info(context.uiLogger.error(`[${model.project.resolvedConfig.name}]${diagnostic.file.fileName} (${line + 1},${character +
                1}): ${message}`));
        }
        else {
            context.uiLogger.info(`[${model.project.resolvedConfig.name}] ${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
        }
    };
}
function parseConfigFile(path, tsConfig, system) {
    const result = ts.parseJsonText('tsconfig.json', tsConfig);
    return ts.parseJsonSourceFileConfigFileContent(result, system, path);
}
function getSystem(model, context) {
    return {
        ...ts.sys,
        readFile(path) {
            return context.fileSystem.readFileSync(path_1.resolve(model.project.path, path), 'utf8');
        },
        writeFile(fileName, data, writeByteOrderMark) {
            return context.fileSystem.writeFileSync(path_1.resolve(model.project.path, fileName), data);
        },
        deleteFile(path) {
            return context.fileSystem.unlinkSync(path_1.resolve(model.project.path, path));
        },
        directoryExists(path) {
            return (context.fileSystem.existsSync(path_1.resolve(model.project.path, path)) &&
                context.fileSystem.statSync(path_1.resolve(model.project.path, path)).type === dist_1.FileSystemEntryType.DIRECTORY);
        },
        fileExists(path) {
            return (context.fileSystem.existsSync(path_1.resolve(model.project.path, path)) &&
                context.fileSystem.statSync(path_1.resolve(model.project.path, path)).type === dist_1.FileSystemEntryType.FILE);
        },
        getCurrentDirectory() {
            return model.project.path;
        }
    };
}
//# sourceMappingURL=typescript_compiler.js.map