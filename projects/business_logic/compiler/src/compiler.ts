import { ParsedArguments } from 'argument_parser';
import { CompilerModel, Project, ScriptContext, ProjectBuildData } from 'models';
import { inputPhase } from './phases/input';
import { pluginBasedPhase, pluginBasedChainedPhase } from './phases/plugin_phase';
import { CachedFileSystem, FileSystemMutationLogger, MemoryFileSystem, FileSystemMutationOperation } from 'file_system';

export class Compiler {
	public async compile(
		selectedProjects: Project[],
		allProjects: Project[],
		context: ScriptContext,
		args: ParsedArguments
	): Promise<void> {
		const mlfs = new FileSystemMutationLogger(new MemoryFileSystem(), false);
		const fs = new CachedFileSystem(context.fileSystem, mlfs);

		let compileModel: CompilerModel = {
			projectsBuildData: selectedProjects.map<ProjectBuildData>((p) => ({
				bundle: this.getBundle(p, args),
				projectDependencies: new Set(),
				allProjects,
				selectedProjects,
				project: p,
				input: [],
				get output(): string[] {
					return mlfs.fileSystemMutations
						.filter((m) => m.operation === FileSystemMutationOperation.WRITE)
						.map((p) => p.path);
				},
				fileSystem: fs
			}))
		};

		compileModel = await pluginBasedPhase('init', compileModel, context);
		compileModel = await inputPhase(compileModel, context);
		compileModel = await pluginBasedPhase('link', compileModel, context);

		this.sortByDependencies(compileModel, selectedProjects);

		compileModel = await pluginBasedPhase('preProcess', compileModel, context);
		compileModel = await pluginBasedChainedPhase(
			['compile', 'postProcess', { name: 'emit', defaultPlugins: ['output'] }],
			compileModel,
			context
		);
	}

	private sortByDependencies(compileModel: CompilerModel, selectedProjects: Project[]) {
		const order: ProjectBuildData[] = [];
		while (compileModel.projectsBuildData.length > 0) {
			let circle = true;

			for (let i = compileModel.projectsBuildData.length - 1; i >= 0; i--) {
				if (this.hasAll(compileModel.projectsBuildData[i].projectDependencies, selectedProjects, order)) {
					order.push(compileModel.projectsBuildData[i]);
					compileModel.projectsBuildData.splice(i, 1);
					circle = false;
				}
			}

			if (circle) {
				throw new Error('Circular dependency in project dependencies');
			}
		}
		compileModel.projectsBuildData = order;
	}

	private hasAll(projectDependencies: Set<Project>, selectedProjects: Project[], order: ProjectBuildData[]): boolean {
		for (const p of projectDependencies) {
			if (!selectedProjects.includes(p)) {
				continue;
			}
			let has = false;
			for (const o of order) {
				if (o.project === p) {
					has = true;
					break;
				}
			}
			if (!has) {
				return false;
			}
		}

		return true;
	}

	private getBundle(project: Project, args: ParsedArguments): string {
		const bundles = Object.keys(project.resolvedConfig.build.bundles);
		let defaultBundle;
		for (const bundle of bundles) {
			if (args.map[bundle] === true) {
				return bundle;
			}
			if (project.resolvedConfig.build.bundles[bundle].default) {
				defaultBundle = bundle;
			}
		}

		if (defaultBundle) {
			return defaultBundle;
		} else if (bundles.length === 1) {
			return bundles[0];
		} else {
			throw new Error(
				`No bundle could be determined for project ${project} please define a default or state the bundle to be used with a CLI flag`
			);
		}
	}
}

export const compiler: Compiler = new Compiler();
