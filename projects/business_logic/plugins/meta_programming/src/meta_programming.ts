/**
#generator(compiler) {
	compiler.writeLine("console.log('你好世界')")
}
 */

import { MapLike } from '../../../../../typings/common';
import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext, Project } from 'models';
import { FileManipulator } from 'static_analyser';
import { TokenPosition } from 'tslint';
import * as vm from 'vm';

export function metaProgramming(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Evaluating meta programming`);
		for (const file of model.input) {
			if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
				evaluate(file, model.project, model.allProjects, model);
			}
		}
		return model;
	};
}

async function evaluate(
	file: string,
	project: Project,
	allProjects: Project[],
	model: ProjectBuildData
): Promise<void> {
	const fm = new FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
	fm.forEachComment((text: string, position: TokenPosition) => {
		if (text.includes('#generator(')) {
			let code = text.substring(text.indexOf('#generator(') + 1);
			if (code.endsWith('*/')) {
				code = code.substring(0, code.length - 2);
			}
			const replacement = runModule(code);
			return [
				{
					start: position.fullStart,
					end: position.end,
					replacement
				}
			];
		} else {
			return [];
		}
	});
	fm.applyManipulations();
	await model.fileSystem.writeFile(file, fm.content);
}

function runModule(code: string): string {
	const replacement: string[] = [];
	const sandboxContext: any = {
		compiler: {
			writeLine(line: string) {
				replacement.push(line);
			}
		}
	};
	vm.createContext(sandboxContext);
	vm.runInContext(`(function ${code})(compiler)`, sandboxContext);

	return replacement.join('\n');
}
