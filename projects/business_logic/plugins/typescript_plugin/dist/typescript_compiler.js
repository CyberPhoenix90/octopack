"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
const path_1 = require("path");
const file_system_1 = require("../../../../libraries/file_system");
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
    const parsedConfig = JSON.parse(tsConfig);
    delete parsedConfig.compilerOptions.outDir;
    delete parsedConfig.compilerOptions.outFile;
    // parsedConfig.compilerOptions.module = 'es2015';
    const result = ts.parseJsonText('tsconfig.json', JSON.stringify(parsedConfig));
    return ts.parseJsonSourceFileConfigFileContent(result, system, path);
}
function getSystem(model, context) {
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
            model.outFiles[fileName] = {
                fullPath: fileName,
                content: data,
                parent: undefined,
                type: file_system_1.FileSystemEntryType.FILE
            };
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR5cGVzY3JpcHRfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBaUM7QUFFakMsK0JBQXFDO0FBQ3JDLG1FQUF3RTtBQUlqRSxLQUFLLFVBQVUsT0FBTyxDQUFDLEtBQXVCLEVBQUUsT0FBc0I7SUFDNUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLGdCQUFnQixDQUFDLENBQUM7SUFDN0UsTUFBTSxNQUFNLEdBQWMsU0FBUyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNwRCxNQUFNLFlBQVksR0FBRyxlQUFlLENBQ25DLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUNsQixNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsRUFBRSxNQUFNLENBQUMsRUFDcEYsTUFBTSxDQUNOLENBQUM7SUFFRixNQUFNLElBQUksR0FBSSxFQUFVLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDM0YsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBRXBELE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBRXJGLE1BQU0sTUFBTSxHQUFtQixFQUFVLENBQUMsd0JBQXdCLENBQUMsT0FBTyxFQUFFLEdBQUcsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLEVBQUUsQ0FBQyxDQUFTLEVBQUUsRUFB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