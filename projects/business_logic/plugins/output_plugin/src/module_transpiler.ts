import { ProjectBuildData, ScriptContext } from 'models';
import * as ts from 'typescript';

export async function transpile(model: ProjectBuildData, context: ScriptContext): Promise<void> {
	for (const file of model.output) {
		if (file.includes('js')) {
			const output = ts.transpileModule(await model.fileSystem.readFile(file, 'utf8'), {
				compilerOptions: {
					target: ts.ScriptTarget.ESNext,
					module: ts.ModuleKind.CommonJS,
					inlineSourceMap: true
				},
				fileName: file
			});
			if (output.outputText) {
				await model.fileSystem.writeFile(file, output.outputText);
			} else {
				for (const diagnostic of output.diagnostics) {
					const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
					const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
					context.uiLogger.error(
						`[${model.project.resolvedConfig.name}]${diagnostic.file.fileName} (${line + 1},${character +
							1}): ${message}`
					);
				}
			}
		}
	}
}
