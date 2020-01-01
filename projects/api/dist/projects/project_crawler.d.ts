import { Project } from '../../../business_logic/models';
import { ScriptContext } from '../scripts/script';
export declare class ProjectCrawler {
    findProjects(root: string, context: ScriptContext): Promise<Project[]>;
    searchDirectory(result: Project[], path: string, context: ScriptContext): Promise<void>;
    private crawSubfolders;
}
export declare const projectCrawler: ProjectCrawler;
//# sourceMappingURL=project_crawler.d.ts.map