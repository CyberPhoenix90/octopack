import { ParsedArguments } from 'argument_parser';
import { CachedFileSystem, FileSystemMutationLogger, MemoryFileSystem } from 'file_system';
import { CompilerModel, Project, ProjectBuildData, ScriptContext } from 'models';
import { inputPhase } from './phases/input';
import { pluginBasedChainedPhase, pluginBasedPhase } from './phases/plugin_phase';
import { getBundle } from 'config_resolver';

export class Compiler {
	public async compile(
		selectedProjects: Project[],
		allProjects: Project[],
		context: ScriptContext,
		args: ParsedArguments
	): Promise<void> {
		let compileModel: CompilerModel = {
			projectsBuildData: selectedProjects.map<ProjectBuildData>((p) => {
				const mlfs = new FileSystemMutationLogger(new MemoryFileSystem());
				const fs = new CachedFileSystem(context.fileSystem, mlfs);

				const bundle = getBundle(p.resolvedConfig, args.map as any);
				if (!bundle) {
					throw new Error(
						`No bundle could be determined for project ${p} please define a default or state the bundle to be used with a CLI flag`
					);
				}

				return {
					bundle,
					projectDependencies: new Set(),
					allProjects,
					selectedProjects,
					project: p,
					input: [],
					get output(): string[] {
						return Array.from(mlfs.writtenFiles);
					},
					fileSystem: fs
				};
			})
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
}

export const compiler: Compiler = new Compiler();
