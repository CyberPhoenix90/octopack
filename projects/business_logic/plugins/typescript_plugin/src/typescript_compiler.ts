import * as ts from 'typescript';
import { ScriptContext, ProjectBuildData } from 'models';
import { join, resolve } from 'path';
import { FileSystemEntryType } from 'file_system';

export interface TypescriptCompilerConfig {}

export async function compile(model: ProjectBuildData, context: ScriptContext): Promise<ts.ExitStatus> {
	context.uiLogger.info(`[${model.project.resolvedConfig.name}]Compiling...`);
	const system: ts.System = getSystem(model, context);
	const parsedConfig = parseConfigFile(
		model.project.path,
		await context.fileSystem.readFile(join(model.project.path, 'tsconfig.json'), 'utf8'),
		system
	);

	const host = (ts as any).createCompilerHostWorker(parsedConfig.options, undefined, system);
	host.getCurrentDirectory = () => model.project.path;

	const program = ts.createProgram(parsedConfig.fileNames, parsedConfig.options, host);

	const result: ts.ExitStatus = (ts as any).emitFilesAndReportErrors(program, log(model, context), (s: string) => {
		return ts.sys.write(s + ts.sys.newLine);
	});

	return result;
}

function log(model: ProjectBuildData, context: ScriptContext): (diagnostic: ts.Diagnostic) => void {
	return (diagnostic: ts.Diagnostic) => {
		if (diagnostic.file) {
			const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
			const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
			context.uiLogger.error(
				`[${model.project.resolvedConfig.name}]${diagnostic.file.fileName} (${line + 1},${character +
					1}): ${message}`
			);
		} else {
			context.uiLogger.info(
				`[${model.project.resolvedConfig.name}]${ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n')}`
			);
		}
	};
}

function parseConfigFile(path: string, tsConfig: string, system: ts.System): ts.ParsedCommandLine {
	const parsedConfig = JSON.parse(tsConfig);
	delete parsedConfig.compilerOptions.outDir;
	delete parsedConfig.compilerOptions.outFile;
	parsedConfig.compilerOptions.module = 'es2015';

	const result = ts.parseJsonText('tsconfig.json', JSON.stringify(parsedConfig));
	return ts.parseJsonSourceFileConfigFileContent(result, system, path);
}

function getSystem(model: ProjectBuildData, context: ScriptContext): ts.System {
	return {
		...ts.sys,
		readFile(path: string) {
			const result = model.files.find((f) => f.fullPath === path);
			if (result) {
				return result.content;
			}

			return context.fileSystem.readFileSync(resolve(model.project.path, path), 'utf8');
		},
		writeFile(fileName: string, data: string, writeByteOrderMark: boolean) {
			model.outFiles[fileName] = {
				fullPath: fileName,
				content: data,
				parent: undefined,
				type: FileSystemEntryType.FILE
			};
		},
		deleteFile(path: string) {
			return context.fileSystem.unlinkSync(resolve(model.project.path, path));
		},
		directoryExists(path: string) {
			return (
				context.fileSystem.existsSync(resolve(model.project.path, path)) &&
				context.fileSystem.statSync(resolve(model.project.path, path)).type === FileSystemEntryType.DIRECTORY
			);
		},
		fileExists(path: string) {
			return (
				context.fileSystem.existsSync(resolve(model.project.path, path)) &&
				context.fileSystem.statSync(resolve(model.project.path, path)).type === FileSystemEntryType.FILE
			);
		},
		getCurrentDirectory(): string {
			return model.project.path;
		}
	};
}
