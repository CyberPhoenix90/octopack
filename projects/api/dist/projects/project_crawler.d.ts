import { Project } from '../../../business_logic/models';
import { FileSystem } from '../../../libraries/file_system/dist';
export declare class ProjectCrawler {
    findProjects(root: string, fileSystem: FileSystem): Promise<Project[]>;
    searchDirectory(result: Project[], path: string, fileSystem: FileSystem): Promise<void>;
    private crawSubfolders;
}
export declare const projectCrawler: ProjectCrawler;
//# sourceMappingURL=project_crawler.d.ts.map