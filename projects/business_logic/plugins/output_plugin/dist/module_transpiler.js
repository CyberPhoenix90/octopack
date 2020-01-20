"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts = require("typescript");
async function transpile(model, context) {
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
            }
            else {
                for (const diagnostic of output.diagnostics) {
                    const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(diagnostic.start);
                    const message = ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n');
                    context.uiLogger.error(`[${model.project.resolvedConfig.name}]${diagnostic.file.fileName} (${line + 1},${character +
                        1}): ${message}`);
                }
            }
        }
    }
}
exports.transpile = transpile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlX3RyYW5zcGlsZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvbW9kdWxlX3RyYW5zcGlsZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxpQ0FBaUM7QUFFMUIsS0FBSyxVQUFVLFNBQVMsQ0FBQyxLQUF1QixFQUFFLE9BQXNCO0lBQzlFLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRTtRQUNoQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDeEIsTUFBTSxNQUFNLEdBQUcsRUFBRSxDQUFDLGVBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsRUFBRTtnQkFDaEYsZUFBZSxFQUFFO29CQUNoQixNQUFNLEVBQUUsRUFBRSxDQUFDLFlBQVksQ0FBQyxNQUFNO29CQUM5QixNQUFNLEVBQUUsRUFBRSxDQUFDLFVBQVUsQ0FBQyxRQUFRO29CQUM5QixlQUFlLEVBQUUsSUFBSTtpQkFDckI7Z0JBQ0QsUUFBUSxFQUFFLElBQUk7YUFDZCxDQUFDLENBQUM7WUFDSCxJQUFJLE1BQU0sQ0FBQyxVQUFVLEVBQUU7Z0JBQ3RCLE1BQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxVQUFVLENBQUMsQ0FBQzthQUMxRDtpQkFBTTtnQkFDTixLQUFLLE1BQU0sVUFBVSxJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7b0JBQzVDLE1BQU0sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyw2QkFBNkIsQ0FBQyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7b0JBQzVGLE1BQU0sT0FBTyxHQUFHLEVBQUUsQ0FBQyw0QkFBNEIsQ0FBQyxVQUFVLENBQUMsV0FBVyxFQUFFLElBQUksQ0FBQyxDQUFDO29CQUM5RSxPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FDckIsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssSUFBSSxHQUFHLENBQUMsSUFBSSxTQUFTO3dCQUMxRixDQUFDLE1BQU0sT0FBTyxFQUFFLENBQ2pCLENBQUM7aUJBQ0Y7YUFDRDtTQUNEO0tBQ0Q7QUFDRixDQUFDO0FBekJELDhCQXlCQyJ9