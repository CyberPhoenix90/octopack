"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_analyser_1 = require("static_analyser");
const path_1 = require("path");
function barrelFile(args) {
    return async (model, context) => {
        if (model.project.resolvedConfig.build.assembly === 'executable') {
            return model;
        }
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Generating barrel file`);
        const optMode = args.optMode;
        if (optMode !== 'in' && optMode !== 'out') {
            context.uiLogger.error(`Expected 'in' or 'out' as optMode but got ${optMode} instead. Not generating barrel file.`);
            return model;
        }
        const pragma = args.pragma;
        if (typeof pragma !== 'string') {
            context.uiLogger.error(`Expected string for pragma but received ${pragma} instead. Not generating barrel file.`);
            return model;
        }
        const fromProjectToBarrelFile = args.output;
        if (fromProjectToBarrelFile.endsWith('.ts') || fromProjectToBarrelFile.endsWith('.js')) {
            return model;
        }
        const barrelFileContent = [];
        const pathToBarrelFile = path_1.join(model.project.path, fromProjectToBarrelFile);
        const pathToBarrelFileFolder = path_1.parse(pathToBarrelFile).dir;
        if (path_1.relative(model.project.path, pathToBarrelFile).startsWith('..')) {
            context.uiLogger.error('Barrel file would be outside of project. Not generating it.');
            return model;
        }
        for (const file of model.input) {
            if (file === pathToBarrelFile) {
                continue;
            }
            let includesPragma = false;
            new static_analyser_1.FileManipulator(await model.fileSystem.readFile(file, 'utf8')).forEachComment((c) => {
                if (c.includes(pragma)) {
                    includesPragma = true;
                }
                return undefined;
            });
            if ((['.ts', '.tsx', '.js', '.jsx'].some((c) => file.endsWith(c)) && optMode === 'in' && includesPragma) ||
                (optMode === 'out' && !includesPragma)) {
                const parsedExportPath = path_1.parse(path_1.relative(pathToBarrelFileFolder, file));
                let exportPath = path_1.join(parsedExportPath.dir, parsedExportPath.name);
                if (!exportPath.startsWith(`.${path_1.sep}`)) {
                    exportPath = `.${path_1.sep}${exportPath}`;
                }
                barrelFileContent.push(`export * from '${exportPath}';\n`);
            }
        }
        if (barrelFileContent.length) {
            await model.fileSystem.writeFile(pathToBarrelFile, barrelFileContent.join(''));
        }
        return model;
    };
}
exports.barrelFile = barrelFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFycmVsX2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvYmFycmVsX2ZpbGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFDQSxxREFBa0Q7QUFDbEQsK0JBQWtEO0FBR2xELFNBQWdCLFVBQVUsQ0FBQyxJQUFrQjtJQUM1QyxPQUFPLEtBQUssRUFBRSxLQUF1QixFQUFFLE9BQXNCLEVBQUUsRUFBRTtRQUNoRSxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxRQUFRLEtBQUssWUFBWSxFQUFFO1lBQ2pFLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxPQUFPLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLElBQUkseUJBQXlCLENBQUMsQ0FBQztRQUV0RixNQUFNLE9BQU8sR0FBVyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3JDLElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxPQUFPLEtBQUssS0FBSyxFQUFFO1lBQzFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUNyQiw2Q0FBNkMsT0FBTyx1Q0FBdUMsQ0FDM0YsQ0FBQztZQUNGLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxNQUFNLE1BQU0sR0FBVyxJQUFJLENBQUMsTUFBTSxDQUFDO1FBQ25DLElBQUksT0FBTyxNQUFNLEtBQUssUUFBUSxFQUFFO1lBQy9CLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUNyQiwyQ0FBMkMsTUFBTSx1Q0FBdUMsQ0FDeEYsQ0FBQztZQUNGLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFDRCxNQUFNLHVCQUF1QixHQUFXLElBQUksQ0FBQyxNQUFNLENBQUM7UUFDcEQsSUFBSSx1QkFBdUIsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksdUJBQXVCLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQ3ZGLE9BQU8sS0FBSyxDQUFDO1NBQ2I7UUFFRCxNQUFNLGlCQUFpQixHQUFhLEVBQUUsQ0FBQztRQUV2QyxNQUFNLGdCQUFnQixHQUFHLFdBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSx1QkFBdUIsQ0FBQyxDQUFDO1FBQzNFLE1BQU0sc0JBQXNCLEdBQUcsWUFBSyxDQUFDLGdCQUFnQixDQUFDLENBQUMsR0FBRyxDQUFDO1FBQzNELElBQUksZUFBUSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUFFLGdCQUFnQixDQUFDLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO1lBQ3BFLE9BQU8sQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLDZEQUE2RCxDQUFDLENBQUM7WUFDdEYsT0FBTyxLQUFLLENBQUM7U0FDYjtRQUVELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtZQUMvQixJQUFJLElBQUksS0FBSyxnQkFBZ0IsRUFBRTtnQkFDOUIsU0FBUzthQUNUO1lBRUQsSUFBSSxjQUFjLEdBQUcsS0FBSyxDQUFDO1lBQzNCLElBQUksaUNBQWUsQ0FBQyxNQUFNLEtBQUssQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO2dCQUN2RixJQUFJLENBQUMsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLEVBQUU7b0JBQ3ZCLGNBQWMsR0FBRyxJQUFJLENBQUM7aUJBQ3RCO2dCQUNELE9BQU8sU0FBUyxDQUFDO1lBQ2xCLENBQUMsQ0FBQyxDQUFDO1lBRUgsSUFDQyxDQUFDLENBQUMsS0FBSyxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksT0FBTyxLQUFLLElBQUksSUFBSSxjQUFjLENBQUM7Z0JBQ3BHLENBQUMsT0FBTyxLQUFLLEtBQUssSUFBSSxDQUFDLGNBQWMsQ0FBQyxFQUNyQztnQkFDRCxNQUFNLGdCQUFnQixHQUFHLFlBQUssQ0FBQyxlQUFRLENBQUMsc0JBQXNCLEVBQUUsSUFBSSxDQUFDLENBQUMsQ0FBQztnQkFDdkUsSUFBSSxVQUFVLEdBQUcsV0FBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFHLEVBQUUsQ0FBQyxFQUFFO29CQUN0QyxVQUFVLEdBQUcsSUFBSSxVQUFHLEdBQUcsVUFBVSxFQUFFLENBQUM7aUJBQ3BDO2dCQUVELGlCQUFpQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsVUFBVSxNQUFNLENBQUMsQ0FBQzthQUMzRDtTQUNEO1FBRUQsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUU7WUFDN0IsTUFBTSxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztTQUMvRTtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2QsQ0FBQyxDQUFDO0FBQ0gsQ0FBQztBQXBFRCxnQ0FvRUMifQ==