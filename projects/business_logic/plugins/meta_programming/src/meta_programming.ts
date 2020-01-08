/**
#generator(compiler) {
	compiler.writeLine("console.log('hello world')")
}
 */

import { MapLike } from '../../../../../typings/common';
import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext, Project } from 'models';
import { VirtualFile } from 'file_system';
import { FileManipulator } from 'static_analyser';
import { TokenPosition } from 'tslint';
import * as vm from 'vm';

export function metaProgramming(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Evaluating meta programming`);
		for (const file of model.files) {
			if (
				file.fullPath.endsWith('.ts') ||
				file.fullPath.endsWith('.tsx') ||
				file.fullPath.endsWith('.js') ||
				file.fullPath.endsWith('.jsx')
			) {
				evaluate(file, model.project, model.allProjects);
			}
		}
		return model;
	};
}

function evaluate(file: VirtualFile, project: Project, allProjects: Project[]) {
	const fm = new FileManipulator(file.content);
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
	file.content = fm.content;
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
