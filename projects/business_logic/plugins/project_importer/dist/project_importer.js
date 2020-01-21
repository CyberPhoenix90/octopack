"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_analyser_1 = require("static_analyser");
const typescript_1 = require("typescript");
function projectImporter(args) {
    return async (model, context) => {
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
        for (const file of model.input) {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                await remapImports(file, model);
            }
        }
        return model;
    };
}
exports.projectImporter = projectImporter;
async function remapImports(file, model) {
    const fm = new static_analyser_1.FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
    fm.queryAst((node) => {
        if (typescript_1.isImportDeclaration(node)) {
            if (node.moduleSpecifier) {
                const moduleName = node.moduleSpecifier.text;
                if (!moduleName.startsWith('.')) {
                    const [name] = moduleName.split('/');
                    const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
                    if (target) {
                        model.projectDependencies.add(target);
                    }
                }
            }
            return [];
        }
        else {
            return [];
        }
    });
    fm.applyManipulations();
    await model.fileSystem.writeFile(file, fm.content);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdF9pbXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByb2plY3RfaW1wb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQ0EsT0FBTyxFQUFFLGVBQWUsRUFBRSxNQUFNLGlCQUFpQixDQUFDO0FBQ2xELE9BQU8sRUFBRSxtQkFBbUIsRUFBRSxNQUFNLFlBQVksQ0FBQztBQUdqRCxNQUFNLFVBQVUsZUFBZSxDQUFDLElBQWtCO0lBQ2pELE9BQU8sS0FBSyxFQUFFLEtBQXVCLEVBQUUsT0FBc0IsRUFBRSxFQUFFO1FBQ2hFLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSwwQkFBMEIsQ0FBQyxDQUFDO1FBQ3ZGLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtZQUMvQixJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7Z0JBQ25HLE1BQU0sWUFBWSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsQ0FBQzthQUNoQztTQUNEO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSCxDQUFDO0FBRUQsS0FBSyxVQUFVLFlBQVksQ0FBQyxJQUFZLEVBQUUsS0FBdUI7SUFDaEUsTUFBTSxFQUFFLEdBQUcsSUFBSSxlQUFlLENBQUMsTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztJQUM5RSxFQUFFLENBQUMsUUFBUSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUU7UUFDcEIsSUFBSSxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsRUFBRTtZQUM5QixJQUFJLElBQUksQ0FBQyxlQUFlLEVBQUU7Z0JBQ3pCLE1BQU0sVUFBVSxHQUFZLElBQUksQ0FBQyxlQUF1QixDQUFDLElBQUksQ0FBQztnQkFDOUQsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQ2hDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNyQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7b0JBQzdFLElBQUksTUFBTSxFQUFFO3dCQUNYLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3RDO2lCQUNEO2FBQ0Q7WUFDRCxPQUFPLEVBQUUsQ0FBQztTQUNWO2FBQU07WUFDTixPQUFPLEVBQUUsQ0FBQztTQUNWO0lBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN4QixNQUFNLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDcEQsQ0FBQyJ9
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdF9pbXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByb2plY3RfaW1wb3J0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxxREFBa0Q7QUFDbEQsMkNBQWlEO0FBQ2pELFNBQWdCLGVBQWUsQ0FBQyxJQUFJO0lBQ2hDLE9BQU8sS0FBSyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsRUFBRTtRQUM1QixPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUksMEJBQTBCLENBQUMsQ0FBQztRQUN2RixLQUFLLE1BQU0sSUFBSSxJQUFJLEtBQUssQ0FBQyxLQUFLLEVBQUU7WUFDNUIsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxJQUFJLElBQUksQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFO2dCQUNoRyxNQUFNLFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDbkM7U0FDSjtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUMsQ0FBQztBQUNOLENBQUM7QUFWRCwwQ0FVQztBQUNELEtBQUssVUFBVSxZQUFZLENBQUMsSUFBSSxFQUFFLEtBQUs7SUFDbkMsTUFBTSxFQUFFLEdBQUcsSUFBSSxpQ0FBZSxDQUFDLE1BQU0sS0FBSyxDQUFDLFVBQVUsQ0FBQyxRQUFRLENBQUMsSUFBSSxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUM7SUFDOUUsRUFBRSxDQUFDLFFBQVEsQ0FBQyxDQUFDLElBQUksRUFBRSxFQUFFO1FBQ2pCLElBQUksZ0NBQW1CLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDM0IsSUFBSSxJQUFJLENBQUMsZUFBZSxFQUFFO2dCQUN0QixNQUFNLFVBQVUsR0FBRyxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQztnQkFDN0MsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7b0JBQzdCLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO29CQUNyQyxNQUFNLE1BQU0sR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxJQUFJLEtBQUssSUFBSSxDQUFDLENBQUM7b0JBQzdFLElBQUksTUFBTSxFQUFFO3dCQUNSLEtBQUssQ0FBQyxtQkFBbUIsQ0FBQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7cUJBQ3pDO2lCQUNKO2FBQ0o7WUFDRCxPQUFPLEVBQUUsQ0FBQztTQUNiO2FBQ0k7WUFDRCxPQUFPLEVBQUUsQ0FBQztTQUNiO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN4QixNQUFNLEtBQUssQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDdkQsQ0FBQztBQUNELGtoRUFBa2hFIn0=