import { Project } from '../../../models/dist';
import { spawn } from 'child_process';

export async function npmInstallPlugin(projects: Project[]): Promise<void> {
	const promises: Promise<void>[] = [];
	for (const project of projects) {
		npmInstall(project);
	}

	await Promise.all(promises);
}

function npmInstall(project: Project): Promise<void> {
	return new Promise((resolve, reject) => {
		const handle = spawn('npm', ['install'], {
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
