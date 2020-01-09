"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("../../../business_logic/compiler");
const project_crawler_1 = require("../projects/project_crawler");
const script_1 = require("./script");
class Build extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Builds stuff'
        };
    }
    async run(args, context) {
        const allProjects = await project_crawler_1.projectCrawler.findProjects(context.workspaceRoot, context);
        const selectedProjects = this.getSelectedProjects(args, allProjects, context);
        if (selectedProjects.length) {
            await compiler_1.compiler.compile(selectedProjects, allProjects, context, args);
        }
        else {
            context.uiLogger.error('None of the provided names were matching a project. Not building.');
        }
        return {};
    }
    getSelectedProjects(args, projects, context) {
        if (!args.list.length) {
            return projects;
        }
        else {
            const selectedProjects = [];
            projects.forEach((p) => {
                if (args.list.includes(p.resolvedConfig.name)) {
                    selectedProjects.push(p);
                }
            });
            if (selectedProjects.length < args.list.length) {
                const notFoundNames = [];
                const selectedProjectNames = selectedProjects.map((p) => p.resolvedConfig.name);
                args.list.forEach((a) => {
                    if (!selectedProjectNames.includes(a)) {
                        notFoundNames.push(a);
                    }
                });
                context.uiLogger.warn(`No project(s) with the name(s) ${notFoundNames.join(', ')} could be located. Skipping these arguments.`);
            }
            return selectedProjects;
        }
    }
}
exports.Build = Build;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJidWlsZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtEQUE0RDtBQUc1RCxpRUFBNkQ7QUFDN0QscUNBQXNEO0FBRXRELE1BQWEsS0FBTSxTQUFRLGVBQU07SUFDekIsWUFBWTtRQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLHlCQUF5QixDQUFDLENBQUM7SUFDNUMsQ0FBQztJQUVNLElBQUk7UUFDVixPQUFPO1lBQ04sV0FBVyxFQUFFLGNBQWM7U0FDM0IsQ0FBQztJQUNILENBQUM7SUFFTSxLQUFLLENBQUMsR0FBRyxDQUFDLElBQXFCLEVBQUUsT0FBc0I7UUFDN0QsTUFBTSxXQUFXLEdBQUcsTUFBTSxnQ0FBYyxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsYUFBYSxFQUFFLE9BQU8sQ0FBQyxDQUFDO1FBQ3RGLE1BQU0sZ0JBQWdCLEdBQUcsSUFBSSxDQUFDLG1CQUFtQixDQUFDLElBQUksRUFBRSxXQUFXLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFFOUUsSUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLEVBQUU7WUFDNUIsTUFBTSxtQkFBUSxDQUFDLE9BQU8sQ0FBQyxnQkFBZ0IsRUFBRSxXQUFXLEVBQUUsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1NBQ3JFO2FBQU07WUFDTixPQUFPLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxtRUFBbUUsQ0FBQyxDQUFDO1NBQzVGO1FBRUQsT0FBTyxFQUFFLENBQUM7SUFDWCxDQUFDO0lBRU8sbUJBQW1CLENBQUMsSUFBcUIsRUFBRSxRQUFtQixFQUFFLE9BQXNCO1FBQzdGLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRTtZQUN0QixPQUFPLFFBQVEsQ0FBQztTQUNoQjthQUFNO1lBQ04sTUFBTSxnQkFBZ0IsR0FBYyxFQUFFLENBQUM7WUFFdkMsUUFBUSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUN0QixJQUFJLElBQUksQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUFDLEVBQUU7b0JBQzlDLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDekI7WUFDRixDQUFDLENBQUMsQ0FBQztZQUVILElBQUksZ0JBQWdCLENBQUMsTUFBTSxHQUFHLElBQUksQ0FBQyxJQUFJLENBQUMsTUFBTSxFQUFFO2dCQUMvQyxNQUFNLGFBQWEsR0FBYSxFQUFFLENBQUM7Z0JBQ25DLE1BQU0sb0JBQW9CLEdBQUcsZ0JBQWdCLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUVoRixJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO29CQUN2QixJQUFJLENBQUMsb0JBQW9CLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxFQUFFO3dCQUN0QyxhQUFhLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO3FCQUN0QjtnQkFDRixDQUFDLENBQUMsQ0FBQztnQkFFSCxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FDcEIsa0NBQWtDLGFBQWEsQ0FBQyxJQUFJLENBQ25ELElBQUksQ0FDSiw4Q0FBOEMsQ0FDL0MsQ0FBQzthQUNGO1lBQ0QsT0FBTyxnQkFBZ0IsQ0FBQztTQUN4QjtJQUNGLENBQUM7Q0FDRDtBQXZERCxzQkF1REMifQ==