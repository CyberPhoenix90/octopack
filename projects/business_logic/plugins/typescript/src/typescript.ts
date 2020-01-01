import { Project } from '../../../models';
import { spawn } from 'child_process';
import { join } from 'path';

export async function typescriptPlugin(projects: Project[]): Promise<void> {
	const promises: Promise<void>[] = [];
	for (const project of projects) {
		promises.push(buildProject(project));
	}

	await Promise.all(promises);
}

function buildProject(project: Project): Promise<void> {
	const typescript = join(__dirname, '../node_modules/typescript/bin/tsc');
	return new Promise((resolve, reject) => {
		const handle = spawn(typescript, [], {
			stdio: 'inherit',
			cwd: project.path
		});

		handle.on('error', (err) => {
			reject(err);
		});

		handle.on('close', () => {
			resolve();
		});

		handle.on('exit', (code) => {
			if (code !== 0) {
				reject(code);
			} else {
				resolve();
			}
		});
	});
}
