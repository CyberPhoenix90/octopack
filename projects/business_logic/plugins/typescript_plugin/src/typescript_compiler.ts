import * as ts from 'typescript';
import { ScriptContext, ProjectBuildData } from 'models';
import { join, resolve, isAbsolute } from 'path';
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
		getCurrentDirectory: () => {
			return model.project.path;
		},
		readFile(path: string) {
			return model.fileSystem.readFileSync(resolve(model.project.path, path), 'utf8');
		},
		writeFile(fileName: string, data: string, writeByteOrderMark: boolean) {
			return model.fileSystem.writeFileSync(resolve(model.project.path, fileName), data);
		},
		deleteFile(path: string) {
			return model.fileSystem.unlinkSync(resolve(model.project.path, path));
		},
		realpath(path: string) {
			return model.fileSystem.realpathSync(path);
		},
		createDirectory: (path) => {
			if (!isAbsolute(path)) {
				path = join(model.project.path, path);
			}
			model.fileSystem.mkdirSync(path);
		},
		readDirectory(path: string, extensions: string[], exclude: string[], include: string[], depth) {
			if (depth) {
				throw new Error('Internal error: depth paramteter not supported in typescript system shim');
			}
			const result = [];
			for (const i of include) {
				result.push(
					...model.fileSystem.globSync(path, i, {
						extensionWhiteList: extensions
					})
				);
			}
			return result;
		},
		directoryExists(path: string) {
			return (
				model.fileSystem.existsSync(resolve(model.project.path, path)) &&
				model.fileSystem.statSync(resolve(model.project.path, path)).type === FileSystemEntryType.DIRECTORY
			);
		},
		fileExists(path: string) {
			return (
				model.fileSystem.existsSync(resolve(model.project.path, path)) &&
				model.fileSystem.statSync(resolve(model.project.path, path)).type === FileSystemEntryType.FILE
			);
		}
	};
}
