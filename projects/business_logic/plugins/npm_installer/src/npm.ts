import { Project, OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { spawn } from 'child_process';
import { MapLike } from '../../../../../typings/common';
import { join } from 'path';

export function npmInstall(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		if (await context.fileSystem.exists(join(model.project.path, 'package.json'))) {
			const pkg = JSON.parse(await context.fileSystem.readFile(join(model.project.path, 'package.json'), 'utf8'));

			if (
				pkg.dependencies &&
				Object.keys(pkg.dependencies).length > 0 &&
				!(await isUpToDate(model, context, pkg))
			) {
				context.uiLogger.info(`[${model.project.resolvedConfig.name}]Installing npm dependencies`);
				await install(model.project);
			}
		}
		return model;
	};
}

async function isUpToDate(model: ProjectBuildData, context: ScriptContext, pkg: any): Promise<boolean> {
	if (await context.fileSystem.exists(join(model.project.path, 'package-lock.json'))) {
		const lockFile = JSON.parse(
			await context.fileSystem.readFile(join(model.project.path, 'package-lock.json'), 'utf8')
		);
		for (const dep of Object.keys(pkg.dependencies)) {
			if (await context.fileSystem.exists(join(model.project.path, 'node_modules', dep, 'package.json'))) {
				const depPkg = JSON.parse(
					await context.fileSystem.readFile(
						join(model.project.path, 'node_modules', dep, 'package.json'),
						'utf8'
					)
				);

				if (depPkg.version !== lockFile.dependencies[dep].version) {
					return false;
				}
			} else {
				return false;
			}
		}
	} else {
		return false;
	}
	return true;
}

async function install(project: Project, isRetry: boolean = false): Promise<void> {
	await runCommand('npm', ['install']);
	await runCommand('npm', ['install', '--package-lock-only']);

	function runCommand(cli: string, args: string[]): Promise<void> {
		return new Promise((resolve, reject) => {
			const handle = spawn(cli, args, {
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
}
