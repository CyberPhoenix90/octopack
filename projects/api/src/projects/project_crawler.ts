import { join } from 'path';
import { loadConfig, OCTOPACK_CONFIG_FILE_NAME, resolveConfig } from 'config_resolver';
import { ScriptContext, Project } from 'models';

export class ProjectCrawler {
	private cache: Project[];

	public async findProjects(root: string, context: ScriptContext): Promise<Project[]> {
		if (!this.cache) {
			const result: Project[] = [];
			await this.searchDirectory(result, root, context);
			this.cache = result;
		}

		return this.cache;
	}

	public async searchDirectory(result: Project[], path: string, context: ScriptContext): Promise<void> {
		if (await context.fileSystem.exists(join(path, OCTOPACK_CONFIG_FILE_NAME))) {
			const config = await loadConfig(path, context.fileSystem);
			if (config.scope === 'project' || config.isProject) {
				result.push({
					path,
					projectDependencies: new Set(),
					fileDependencies: new Map(),
					rawConfig: config,
					resolvedConfig: resolveConfig({
						project: config,
						workspace: context.workspaceConfig
					})
				});
			} else {
				await this.crawSubfolders(context, path, result);
			}
		} else {
			await this.crawSubfolders(context, path, result);
		}
	}

	private async crawSubfolders(context: ScriptContext, path: string, result: Project[]) {
		const directories = await context.fileSystem.getSubfolders(path);
		for (const dir of directories) {
			await this.searchDirectory(result, dir, context);
		}
	}
}

export const projectCrawler: ProjectCrawler = new ProjectCrawler();
