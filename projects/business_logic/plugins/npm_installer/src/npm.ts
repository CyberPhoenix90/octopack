import { Project, OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from '../../../models';
import { spawn } from 'child_process';
import { MapLike } from '../../../../../typings/common';

export function npmInstall(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		context.uiLogger.info(`[${model.project.resolvedConfig.name}]Installing npm dependencies`);
		await install(model.project);
		return model;
	};
}

function install(project: Project, isRetry: boolean = false): Promise<void> {
	return new Promise((resolve, reject) => {
		const handle = spawn('npm', ['install'], {
			cwd: project.path
		});

		const stdBuffer: string[] = [];
		handle.stdout.on('data', (msg) => {
			stdBuffer.push(msg);
		});
		handle.stderr.on('data', (msg) => {
			stdBuffer.push(msg);
		});

		handle.on('error', (err) => {
			reject(err);
		});

		handle.on('close', () => {
			resolve();
		});

		handle.on('exit', (code) => {
			if (code !== 0) {
				if (isRetry) {
					console.error(stdBuffer.join(''));
					reject(code);
				} else {
					install(project, true).then(resolve, reject);
				}
			} else {
				resolve();
			}
		});
	});
}
