import { Project } from '../../../models/dist';
import { spawn } from 'child_process';

export async function npmInstallPlugin(projects: Project[]): Promise<void> {
	const promises: Promise<void>[] = [];
	for (const project of projects) {
		promises.push(npmInstall(project));
	}

	await Promise.all(promises);
}

function npmInstall(project: Project, isRetry: boolean = false): Promise<void> {
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
					npmInstall(project, true).then(resolve, reject);
				}
			} else {
				resolve();
			}
		});
	});
}
