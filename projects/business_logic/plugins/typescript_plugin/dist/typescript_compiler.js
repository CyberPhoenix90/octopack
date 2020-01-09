"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path_1 = require("path");
const file_system_1 = require("../../../../libraries/file_system");
async function compile(model, context) {
    const writtenFiles = new Set();
    context.uiLogger.info(`[${model.project.resolvedConfig.name}] Compiling...`);
    const system = getSystem(model, context, writtenFiles);
    const parsedConfig = parseConfigFile(model.project.path, await context.fileSystem.readFile(path_1.join(model.project.path, 'tsconfig.json'), 'utf8'), system);
    const parent = findLowestCommonFolder(parsedConfig.fileNames);
    console.log(parent);
    const host = ts.createCompilerHostWorker(parsedConfig.options, undefined, system);
    host.getCurrentDirectory = () => model.project.path;
    const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options, host);
    const result = ts.emitFilesAndReportErrors(program, log(model, context), (s) => {
        return ts.sys.write(s + ts.sys.newLine);
    });
    for (const file of writtenFiles) {
        model.files.push(await context.fileSystem.toVirtualFile(file));
    }
    return result;
}
exports.compile = compile;
function findLowestCommonFolder(files) {
    if (files.length === 0) {
        return '';
    }
    let candidate = path_1.parse(files[0]).dir;
    for (let i = 1; i < files.length; i++) {
        while (!isChildOf(path_1.parse(files[i]).dir, candidate)) {
            if (candidate === '/') {
                throw new Error('Could not determine common folder between files in compilation');
            }
            candidate = path_1.join(candidate, '..');
        }
    }
    return candidate;
}
function isChildOf(file, folder) {
    while (file !== '/') {
        if (file === folder) {
            return true;
        }
        else {
            file = path_1.join(file, '..');
        }
    }
    return file === folder;
}
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
function getSystem(model, context, writtenFiles) {
    return {
        ...ts.sys,
        readFile(path) {
            const result = model.files.find((f) => f.fullPath === path);
            if (result) {
                return result.content;
            }
            return context.fileSystem.readFileSync(path_1.resolve(model.project.path, path), 'utf8');
        },
        writeFile(fileName, data, writeByteOrderMark) {
            writtenFiles.add(fileName);
            return context.fileSystem.writeFileSync(path_1.resolve(model.project.path, fileName), data);
        },
        deleteFile(path) {
            return context.fileSystem.unlinkSync(path_1.resolve(model.project.path, path));
        },
        directoryExists(path) {
            return (context.fileSystem.existsSync(path_1.resolve(model.project.path, path)) &&
                context.fileSystem.statSync(path_1.resolve(model.project.path, path)).type === file_system_1.FileSystemEntryType.DIRECTORY);
        },
        fileExists(path) {
            return (context.fileSystem.existsSync(path_1.resolve(model.project.path, path)) &&
                context.fileSystem.statSync(path_1.resolve(model.project.path, path)).type === file_system_1.FileSystemEntryType.FILE);
        },
        getCurrentDirectory() {
            return model.project.path;
        }
    };
}
//# sourceMappingURL=typescript_compiler.js.map