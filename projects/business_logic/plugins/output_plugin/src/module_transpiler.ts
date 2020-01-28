import * as combine from 'combine-source-map';
import { fromComment } from 'convert-source-map';
import { ProjectBuildData, ScriptContext } from 'models';
import * as ts from 'typescript';

export async function transpile(model: ProjectBuildData, context: ScriptContext): Promise<void> {
	for (const file of model.output) {
		if (file.includes('js')) {
			const originalContent = await model.fileSystem.readFile(file, 'utf8');
			let content: string;
			let mappedFile;

			const sourceMapIndex = originalContent.indexOf('\n//# sourceMappingURL=');
			if (sourceMapIndex !== -1) {
				content = originalContent.substring(0, sourceMapIndex);
				mappedFile = fromComment(originalContent.substring(sourceMapIndex + 1)).toObject().file;
			} else {
				content = originalContent;
			}

			const output = ts.transpileModule(content, {
				compilerOptions: {
					target: ts.ScriptTarget.ESNext,
					module:
						model.project.resolvedConfig.platform === 'browser'
							? ts.ModuleKind.UMD
							: ts.ModuleKind.CommonJS,
					inlineSourceMap: true
				},
				fileName: file
			});
			if (output.outputText) {
				let result = output.outputText.substring(0, output.outputText.indexOf('\n//# sourceMappingURL='));
				if (sourceMapIndex !== -1) {
					result +=
						'\n' +
						combine
							.create(mappedFile)
							.addFile({
								source: originalContent,
								sourceFile: mappedFile
							})
							.addFile({ source: output.outputText, sourceFile: mappedFile })
							.comment();
				}

				await model.fileSystem.writeFile(file, result);
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
