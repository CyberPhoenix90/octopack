'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
const child_process_1 = require('child_process');
const path_1 = require('path');
function npmInstall(args) {
	return async (model, context) => {
		if (await context.fileSystem.exists(path_1.join(model.project.path, 'package.json'))) {
			const pkg = JSON.parse(
				await context.fileSystem.readFile(path_1.join(model.project.path, 'package.json'), 'utf8')
			);
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
exports.npmInstall = npmInstall;
async function isUpToDate(model, context, pkg) {
	if (await context.fileSystem.exists(path_1.join(model.project.path, 'package-lock.json'))) {
		const lockFile = JSON.parse(
			await context.fileSystem.readFile(path_1.join(model.project.path, 'package-lock.json'), 'utf8')
		);
		for (const dep of Object.keys(pkg.dependencies)) {
			if (await context.fileSystem.exists(path_1.join(model.project.path, 'node_modules', dep, 'package.json'))) {
				const depPkg = JSON.parse(
					await context.fileSystem.readFile(
						path_1.join(model.project.path, 'node_modules', dep, 'package.json'),
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
async function install(project, isRetry = false) {
	await runCommand('npm', ['install']);
	await runCommand('npm', ['install', '--package-lock-only']);
	function runCommand(cli, args) {
		return new Promise((resolve, reject) => {
			const handle = child_process_1.spawn(cli, args, {
				cwd: project.path
			});
			const stdBuffer = [];
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
//# sourceMappingURL=npm.js.map
