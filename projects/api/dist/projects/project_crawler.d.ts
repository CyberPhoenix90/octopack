import { ScriptContext, Project } from 'models';
export declare class ProjectCrawler {
    private cache;
    findProjects(root: string, context: ScriptContext): Promise<Project[]>;
    searchDirectory(result: Project[], path: string, context: ScriptContext): Promise<void>;
    private crawSubfolders;
}
export declare const projectCrawler: ProjectCrawler;
//# sourceMappingURL=project_crawler.d.ts.map