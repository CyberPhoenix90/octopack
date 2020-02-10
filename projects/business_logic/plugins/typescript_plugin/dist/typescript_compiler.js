"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path_1 = require("path");
const file_system_1 = require("file_system");
async function compile(model, context) {
    context.uiLogger.info(`[${model.project.resolvedConfig.name}]Compiling...`);
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
            context.uiLogger.error(`[${model.project.resolvedConfig.name}]${diagnostic.file.fileName} (${line + 1},${character +
                1}): ${message}`);
        }
        else {
            context.uiLogger.info(`[${model.project.resolvedConfig.name}]${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`);
        }
    };
}
function parseConfigFile(path, tsConfig, system) {
    const parsedConfig = JSON.parse(tsConfig);
    delete parsedConfig.compilerOptions.outDir;
    delete parsedConfig.compilerOptions.outFile;
    delete parsedConfig.compilerOptions.sourceMap;
    parsedConfig.compilerOptions.inlineSourceMap = true;
    parsedConfig.compilerOptions.module = 'esnext';
    const result = ts.parseJsonText('tsconfig.json', JSON.stringify(parsedConfig));
    return ts.parseJsonSourceFileConfigFileContent(result, system, path);
}
function getSystem(model, context) {
    return {
        ...ts.sys,
        getCurrentDirectory: () => {
            return model.project.path;
        },
        readFile(path) {
            return model.fileSystem.readFileSync(path_1.resolve(model.project.path, path), 'utf8');
        },
        writeFile(fileName, data, writeByteOrderMark) {
            return model.fileSystem.writeFileSync(path_1.resolve(model.project.path, fileName), data);
        },
        deleteFile(path) {
            return model.fileSystem.unlinkSync(path_1.resolve(model.project.path, path));
        },
        realpath(path) {
            return model.fileSystem.realpathSync(path);
        },
        createDirectory: (path) => {
            if (!path_1.isAbsolute(path)) {
                path = path_1.join(model.project.path, path);
            }
            model.fileSystem.mkdirSync(path);
        },
        readDirectory(path, extensions, exclude, include, depth) {
            if (depth) {
                throw new Error('Internal error: depth paramteter not supported in typescript system shim');
            }
            const result = [];
            for (const i of include) {
                result.push(...model.fileSystem.globSync(path, i, {
                    extensionWhiteList: extensions,
                    matchPartialExtensions: true
                }));
            }
            return result;
        },
        directoryExists(path) {
            return (model.fileSystem.existsSync(path_1.resolve(model.project.path, path)) &&
                model.fileSystem.statSync(path_1.resolve(model.project.path, path)).type === file_system_1.FileSystemEntryType.DIRECTORY);
        },
        fileExists(path) {
            return (model.fileSystem.existsSync(path_1.resolve(model.project.path, path)) &&
                model.fileSystem.statSync(path_1.resolve(model.project.path, path)).type === file_system_1.FileSystemEntryType.FILE);
        }
    };
}