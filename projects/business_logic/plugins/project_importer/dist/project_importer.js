"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_analyser_1 = require("../../../../libraries/static_analyser");
const typescript_1 = require("typescript");
const path_1 = require("path");
function projectImporter(args) {
    return async (model, context) => {
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
        for (const file of model.files) {
            if (file.fullPath.endsWith('.ts') ||
                file.fullPath.endsWith('.tsx') ||
                file.fullPath.endsWith('.js') ||
                file.fullPath.endsWith('.jsx')) {
                remapImports(file, model);
            }
        }
        return model;
    };
}
exports.projectImporter = projectImporter;
function remapImports(file, model) {
    const fm = new static_analyser_1.FileManipulator(file.content);
    fm.queryAst((node) => {
        if (typescript_1.isImportDeclaration(node)) {
            if (node.moduleSpecifier) {
                const moduleName = node.moduleSpecifier.text;
                if (!moduleName.startsWith('.')) {
                    const [name, ...path] = moduleName.split('/');
                    const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
                    if (target) {
                        if (model.selectedProjects.includes(target)) {
                            model.projectDependencies.add(target);
                        }
                        const newName = path_1.relative(path_1.parse(file.fullPath).dir, target.path);
                        return [
                            {
                                start: node.moduleSpecifier.getStart() + 1,
                                end: node.moduleSpecifier.getEnd() - 1,
                                replacement: [newName, ...path].join('/')
                            }
                        ];
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
    file.content = fm.content;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvamVjdF9pbXBvcnRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInByb2plY3RfaW1wb3J0ZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFHQSwyRUFBd0U7QUFDeEUsMkNBQWlEO0FBQ2pELCtCQUF1QztBQUV2QyxTQUFnQixlQUFlLENBQUMsSUFBa0I7SUFDakQsT0FBTyxLQUFLLEVBQUUsS0FBdUIsRUFBRSxPQUFzQixFQUFFLEVBQUU7UUFDaEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLDBCQUEwQixDQUFDLENBQUM7UUFDdkYsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQy9CLElBQ0MsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUM3QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQzlCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQzdCO2dCQUNELFlBQVksQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7YUFDMUI7U0FDRDtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQWZELDBDQWVDO0FBRUQsU0FBUyxZQUFZLENBQUMsSUFBaUIsRUFBRSxLQUF1QjtJQUMvRCxNQUFNLEVBQUUsR0FBRyxJQUFJLGlDQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxJQUFJLEVBQUUsRUFBRTtRQUNwQixJQUFJLGdDQUFtQixDQUFDLElBQUksQ0FBQyxFQUFFO1lBQzlCLElBQUksSUFBSSxDQUFDLGVBQWUsRUFBRTtnQkFDekIsTUFBTSxVQUFVLEdBQVksSUFBSSxDQUFDLGVBQXVCLENBQUMsSUFBSSxDQUFDO2dCQUM5RCxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsRUFBRTtvQkFDaEMsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLElBQUksQ0FBQyxHQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7b0JBQzlDLE1BQU0sTUFBTSxHQUFHLEtBQUssQ0FBQyxXQUFXLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsY0FBYyxDQUFDLElBQUksS0FBSyxJQUFJLENBQUMsQ0FBQztvQkFDN0UsSUFBSSxNQUFNLEVBQUU7d0JBQ1gsSUFBSSxLQUFLLENBQUMsZ0JBQWdCLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUFFOzRCQUM1QyxLQUFLLENBQUMsbUJBQW1CLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDO3lCQUN0Qzt3QkFDRCxNQUFNLE9BQU8sR0FBRyxlQUFRLENBQUMsWUFBSyxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDO3dCQUNoRSxPQUFPOzRCQUNOO2dDQUNDLEtBQUssRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUM7Z0NBQzFDLEdBQUcsRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUM7Z0NBQ3RDLFdBQVcsRUFBRSxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUM7NkJBQ3pDO3lCQUNELENBQUM7cUJBQ0Y7aUJBQ0Q7YUFDRDtZQUNELE9BQU8sRUFBRSxDQUFDO1NBQ1Y7YUFBTTtZQUNOLE9BQU8sRUFBRSxDQUFDO1NBQ1Y7SUFDRixDQUFDLENBQUMsQ0FBQztJQUNILEVBQUUsQ0FBQyxrQkFBa0IsRUFBRSxDQUFDO0lBQ3hCLElBQUksQ0FBQyxPQUFPLEdBQUcsRUFBRSxDQUFDLE9BQU8sQ0FBQztBQUMzQixDQUFDIn0=