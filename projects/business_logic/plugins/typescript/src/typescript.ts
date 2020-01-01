import { Project } from '../../../models';
import { spawn } from 'child_process';

export async function typescriptPlugin(projects: Project[]): Promise<void> {
	const promises: Promise<void>[] = [];
	for (const project of projects) {
		promises.push(buildProject(project));
	}

	await Promise.all(promises);
}

function buildProject(project: Project): Promise<void> {
	return new Promise((resolve, reject) => {
		const handle = spawn('tsc', [], {
			stdio: 'inherit',
			cwd: project.path
		});

		handle.on('error', (err) => {
			reject(err);
		});

		handle.on('close', () => {
			resolve();
		});

		handle.on('exit', () => {
			resolve();
		});
	});
}
