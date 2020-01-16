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
    parsedConfig.compilerOptions.module = 'es2015';
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR5cGVzY3JpcHRfY29tcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsT0FBTyxLQUFLLEVBQUUsTUFBTSxZQUFZLENBQUM7QUFFakMsT0FBTyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDckMsT0FBTyxFQUFFLG1CQUFtQixFQUFFLE1BQU0sYUFBYSxDQUFDO0FBSWxELE1BQU0sQ0FBQyxLQUFLLFVBQVUsT0FBTyxDQUFDLEtBQXVCLEVBQUUsT0FBc0I7SUFDNUUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLGVBQWUsQ0FBQyxDQUFDO0lBQzVFLE1BQU0sTUFBTSxHQUFjLFNBQVMsQ0FBQyxLQUFLLEVBQUUsT0FBTyxDQUFDLENBQUM7SUFDcEQsTUFBTSxZQUFZLEdBQUcsZUFBZSxDQUNuQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFDbEIsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZUFBZSxDQUFDLEVBQUUsTUFBTSxDQUFDLEVBQ3BGLE1BQU0sQ0FDTixDQUFDO0lBRUYsTUFBTSxJQUFJLEdBQUksRUFBVSxDQUFDLHdCQUF3QixDQUFDLFlBQVksQ0FBQyxPQUFPLEVBQUUsU0FBUyxFQUFFLE1BQU0sQ0FBQyxDQUFDO0lBQzNGLElBQUksQ0FBQyxtQkFBbUIsR0FBRyxHQUFHLEVBQUUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQztJQUVwRCxNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUMsYUFBYSxDQUFDLFlBQVksQ0FBQyxTQUFTLEVBQUUsWUFBWSxDQUFDLE9BQU8sRUFBRSxJQUFJLENBQUMsQ0FBQztJQUVyRixNQUFN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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidHlwZXNjcmlwdF9jb21waWxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInR5cGVzY3JpcHRfY29tcGlsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxpQ0FBaUM7QUFDakMsK0JBQXFDO0FBQ3JDLDZDQUFrRDtBQUMzQyxLQUFLLFVBQVUsT0FBTyxDQUFDLEtBQUssRUFBRSxPQUFPO0lBQ3hDLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSxlQUFlLENBQUMsQ0FBQztJQUM1RSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxDQUFDO0lBQ3pDLE1BQU0sWUFBWSxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLFdBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxlQUFlLENBQUMsRUFBRSxNQUFNLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQztJQUN2SixNQUFNLElBQUksR0FBRyxFQUFFLENBQUMsd0JBQXdCLENBQUMsWUFBWSxDQUFDLE9BQU8sRUFBRSxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7SUFDbEYsSUFBSSxDQUFDLG1CQUFtQixHQUFHLEdBQUcsRUFBRSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO0lBQ3BELE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyxhQUFhLENBQUMsWUFBWSxDQUFDLFNBQVMsRUFBRSxZQUFZLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO0lBQ3JGLE1BQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyx3QkFBd0IsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLEtBQUssRUFBRSxPQUFPLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFO1FBQzNF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