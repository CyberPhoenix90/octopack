import { Project } from '../../../business_logic/models';
import { FileSystem } from '../../../libraries/file_system/dist';
import { OCTOPACK_CONFIG_FILE_NAME, loadConfig } from '../../../business_logic/config_resolver';
import { join } from 'path';

export class ProjectCrawler {
	public async findProjects(root: string, fileSystem: FileSystem): Promise<Project[]> {
		const result: Project[] = [];
		await this.searchDirectory(result, root, fileSystem);

		return result;
	}

	public async searchDirectory(result: Project[], path: string, fileSystem: FileSystem): Promise<void> {
		if (await fileSystem.exists(join(path, OCTOPACK_CONFIG_FILE_NAME))) {
			const config = await loadConfig(path, fileSystem);
			if (config.scope === 'project') {
				result.push({
					path,
					rawConfig: config
				});
			} else {
				await this.crawSubfolders(fileSystem, path, result);
			}
		} else {
			await this.crawSubfolders(fileSystem, path, result);
		}
	}

	private async crawSubfolders(fileSystem: FileSystem, path: string, result: Project[]) {
		const directories = await fileSystem.getSubfolders(path);
		for (const dir of directories) {
			await this.searchDirectory(result, dir, fileSystem);
		}
	}
}

export const projectCrawler: ProjectCrawler = new ProjectCrawler();
