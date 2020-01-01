import { join } from 'path';
import { loadConfig, OCTOPACK_CONFIG_FILE_NAME, resolveConfig } from '../../../business_logic/config_resolver';
import { Project } from '../../../business_logic/models';
import { ScriptContext } from '../scripts/script';

export class ProjectCrawler {
	public async findProjects(root: string, context: ScriptContext): Promise<Project[]> {
		const result: Project[] = [];
		await this.searchDirectory(result, root, context);

		return result;
	}

	public async searchDirectory(result: Project[], path: string, context: ScriptContext): Promise<void> {
		if (await context.fileSystem.exists(join(path, OCTOPACK_CONFIG_FILE_NAME))) {
			const config = await loadConfig(path, context.fileSystem);
			if (config.scope === 'project') {
				result.push({
					path,
					rawConfig: config,
					resoledConfig: resolveConfig({
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
