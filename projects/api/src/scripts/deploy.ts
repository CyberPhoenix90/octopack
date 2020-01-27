import { ParsedArguments } from 'argument_parser';
import { ScriptContext, Project } from 'models';
import { projectCrawler } from '../projects/project_crawler';
import { Help, Script, ScriptStatus } from './script';
import { getSelectedProjects } from '../projects/project_selector';
import { Build } from './build';
import { getBundle } from 'config_resolver';
import { join } from 'path';
import { spawn } from 'child_process';

export class Deploy extends Script {
	public autoComplete(): Promise<string[]> {
		throw new Error('Method not implemented.');
	}

	public help(): Help {
		return {
			description: 'Deploys stuff'
		};
	}

	public async run(args: ParsedArguments, context: ScriptContext): Promise<ScriptStatus> {
		const allProjects = await projectCrawler.findProjects(context.workspaceRoot, context);
		const selectedProjects = getSelectedProjects(args.list, allProjects, context).filter(
			(p) => p.resolvedConfig.deploy
		);

		if (selectedProjects.length) {
			for (const project of selectedProjects) {
				const deployDir = join(project.path, project.resolvedConfig.deploy.deployDir);

				await new Build().run(
					{
						list: [project.resolvedConfig.name],
						map: {
							...args.map,
							remapImportSource: '../internal_dependencies'
						},
						raw: args.raw
					},
					context
				);
				const bundle = getBundle(project.resolvedConfig, args.map as any);
				if (!bundle) {
					throw new Error(
						`No bundle could be determined for project ${project} please define a default or state the bundle to be used with a CLI flag`
					);
				}

				const config = project.resolvedConfig.build.bundles[bundle];
				const outDir = join(project.path, config.output);
				if (await context.fileSystem.exists(deployDir)) {
					await context.fileSystem.deleteDirectory(deployDir);
				}

				await context.fileSystem.copyDirectory(outDir, join(deployDir, 'dist'));
				await context.fileSystem.copyFile(join(project.path, 'package.json'), join(deployDir, 'package.json'));

				await context.fileSystem.mkdir(join(deployDir, 'internal_dependencies'));
				for (const dep of project.projectDependencies.values()) {
					await this.prepareDependency(dep, args, deployDir, context);
				}

				await install(deployDir);
			}
		} else {
			context.uiLogger.error('Nothing found that can be deployed');
		}

		return {};
	}

	private async prepareDependency(dep: Project, args: ParsedArguments, deployDir: string, context: ScriptContext) {
		const target = join(deployDir, 'internal_dependencies', dep.resolvedConfig.name);
		if (await context.fileSystem.exists(target)) {
			return;
		}

		await new Build().run(
			{
				list: [dep.resolvedConfig.name],
				map: {
					...args.map,
					remapImportSource: '../../'
				},
				raw: args.raw
			},
			context
		);
		await context.fileSystem.mkdir(target);
		const depBundle = getBundle(dep.resolvedConfig, args.map as any);
		const depConfig = dep.resolvedConfig.build.bundles[depBundle];
		const depOutDir = join(dep.path, depConfig.output);
		await context.fileSystem.copyFile(join(dep.path, 'package.json'), join(target, 'package.json'));
		await context.fileSystem.copyDirectory(depOutDir, join(target, 'dist'));
		await install(target);

		for (const subDep of dep.projectDependencies.values()) {
			await this.prepareDependency(subDep, args, deployDir, context);
		}
	}
}

async function install(path: string, isRetry: boolean = false): Promise<void> {
	await runCommand('npm', ['install']);
	await runCommand('npm', ['install', '--package-lock-only']);

	function runCommand(cli: string, args: string[]): Promise<void> {
		return new Promise((resolve, reject) => {
			const handle = spawn(cli, args, {
				cwd: path
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
						install(path, true).then(resolve, reject);
					}
				} else {
					resolve();
				}
			});
		});
	}
}
