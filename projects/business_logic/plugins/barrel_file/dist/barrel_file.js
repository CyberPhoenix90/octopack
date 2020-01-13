"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function barrelFile(args) {
    return async (model, context) => {
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Generating barrel file`);
        const barrelFileContent = [];
        const optMode = 'out';
        const pragma = '@/ignore'.replace('/', ''); // so the file doesn't include the pragma wrongly
        const fileSystem = context.fileSystem;
        const pathToBarrelFileFolder = path_1.join(model.project.path, 'src');
        const pathToBarrelFile = path_1.join(pathToBarrelFileFolder, 'index.ts');
        if (path_1.relative(model.project.path, pathToBarrelFile).startsWith('..')) {
            context.uiLogger.error('Barrel file would be outside of project. Not generating it.');
            return model;
        }
        for (const file of model.files) {
            const { fullPath } = file;
            if (fullPath === pathToBarrelFile) {
                continue;
            }
            if (([
                fullPath.endsWith('.ts'),
                fullPath.endsWith('.tsx'),
                fullPath.endsWith('.js'),
                fullPath.endsWith('.jsx')
            ].some((c) => c) &&
                optMode === 'in' &&
                file.content.includes(pragma)) ||
                (optMode === 'out' && !file.content.includes(pragma))) {
                const parsedExportPath = path_1.parse(path_1.relative(pathToBarrelFileFolder, file.fullPath));
                let exportPath = path_1.join(parsedExportPath.dir, parsedExportPath.name);
                if (!exportPath.startsWith(`.${path_1.sep}`)) {
                    exportPath = `.${path_1.sep}${exportPath}`;
                }
                barrelFileContent.push(`export * from '${exportPath}';\n`);
            }
        }
        if (barrelFileContent.length) {
            fileSystem.writeFileSync(pathToBarrelFile, barrelFileContent.join(''));
            // model.files.push({
            // 	fullPath: pathToBarrelFile,
            // 	parent: undefined,
            // 	type: FileSystemEntryType.FILE,
            // 	content: barrelFileContent.join('')
            // });
        }
        return model;
    };
}
exports.barrelFile = barrelFile;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFycmVsX2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYXJyZWxfZmlsZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFDQSxPQUFPLEVBQUUsSUFBSSxFQUFFLFFBQVEsRUFBRSxHQUFHLEVBQUUsS0FBSyxFQUFFLE1BQU0sTUFBTSxDQUFDO0FBR2xELE1BQU0sVUFBVSxVQUFVLENBQUMsSUFBa0I7SUFDNUMsT0FBTyxLQUFLLEVBQUUsS0FBdUIsRUFBRSxPQUFzQixFQUFFLEVBQUU7UUFDaEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLHlCQUF5QixDQUFDLENBQUM7UUFFdEYsTUFBTSxpQkFBaUIsR0FBYSxFQUFFLENBQUM7UUFFdkMsTUFBTSxPQUFPLEdBQVcsS0FBSyxDQUFDO1FBQzlCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsaURBQWlEO1FBQzdGLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFFdEMsTUFBTSxzQkFBc0IsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0QsTUFBTSxnQkFBZ0IsR0FBRyxJQUFJLENBQUMsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEUsSUFBSSxRQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDcEUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztZQUN0RixPQUFPLEtBQUssQ0FBQztTQUNiO1FBRUQsS0FBSyxNQUFNLElBQUksSUFBSSxLQUFLLENBQUMsS0FBSyxFQUFFO1lBQy9CLE1BQU0sRUFBRSxRQUFRLEVBQUUsR0FBRyxJQUFJLENBQUM7WUFFMUIsSUFBSSxRQUFRLEtBQUssZ0JBQWdCLEVBQUU7Z0JBQ2xDLFNBQVM7YUFDVDtZQUVELElBQ0MsQ0FBQztnQkFDQSxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDeEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7Z0JBQ3pCLFFBQVEsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDO2dCQUN4QixRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQzthQUN6QixDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDO2dCQUNmLE9BQU8sS0FBSyxJQUFJO2dCQUNoQixJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0IsQ0FBQyxPQUFPLEtBQUssS0FBSyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUMsRUFDcEQ7Z0JBQ0QsTUFBTSxnQkFBZ0IsR0FBRyxLQUFLLENBQUMsUUFBUSxDQUFDLHNCQUFzQixFQUFFLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO2dCQUNoRixJQUFJLFVBQVUsR0FBRyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsR0FBRyxFQUFFLGdCQUFnQixDQUFDLElBQUksQ0FBQyxDQUFDO2dCQUNuRSxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQyxJQUFJLEdBQUcsRUFBRSxDQUFDLEVBQUU7b0JBQ3RDLFVBQVUsR0FBRyxJQUFJLEdBQUcsR0FBRyxVQUFVLEVBQUUsQ0FBQztpQkFDcEM7Z0JBRUQsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGtCQUFrQixVQUFVLE1BQU0sQ0FBQyxDQUFDO2FBQzNEO1NBQ0Q7UUFFRCxJQUFJLGlCQUFpQixDQUFDLE1BQU0sRUFBRTtZQUM3QixVQUFVLENBQUMsYUFBYSxDQUFDLGdCQUFnQixFQUFFLGlCQUFpQixDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1lBQ3ZFLHFCQUFxQjtZQUNyQiwrQkFBK0I7WUFDL0Isc0JBQXNCO1lBQ3RCLG1DQUFtQztZQUNuQyx1Q0FBdUM7WUFDdkMsTUFBTTtTQUNOO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSCxDQUFDIn0=
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFycmVsX2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJiYXJyZWxfZmlsZS5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLCtCQUFrRDtBQUNsRCxTQUFnQixVQUFVLENBQUMsSUFBSTtJQUMzQixPQUFPLEtBQUssRUFBRSxLQUFLLEVBQUUsT0FBTyxFQUFFLEVBQUU7UUFDNUIsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLHlCQUF5QixDQUFDLENBQUM7UUFDdEYsTUFBTSxpQkFBaUIsR0FBRyxFQUFFLENBQUM7UUFDN0IsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDO1FBQ3RCLE1BQU0sTUFBTSxHQUFHLFVBQVUsQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsaURBQWlEO1FBQzdGLE1BQU0sVUFBVSxHQUFHLE9BQU8sQ0FBQyxVQUFVLENBQUM7UUFDdEMsTUFBTSxzQkFBc0IsR0FBRyxXQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsS0FBSyxDQUFDLENBQUM7UUFDL0QsTUFBTSxnQkFBZ0IsR0FBRyxXQUFJLENBQUMsc0JBQXNCLEVBQUUsVUFBVSxDQUFDLENBQUM7UUFDbEUsSUFBSSxlQUFRLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsZ0JBQWdCLENBQUMsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDakUsT0FBTyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsNkRBQTZELENBQUMsQ0FBQztZQUN0RixPQUFPLEtBQUssQ0FBQztTQUNoQjtRQUNELEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtZQUM1QixNQUFNLEVBQUUsUUFBUSxFQUFFLEdBQUcsSUFBSSxDQUFDO1lBQzFCLElBQUksUUFBUSxLQUFLLGdCQUFnQixFQUFFO2dCQUMvQixTQUFTO2FBQ1o7WUFDRCxJQUFJLENBQUM7Z0JBQ0QsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQ3hCLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUN6QixRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDeEIsUUFBUSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUM7YUFDNUIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQztnQkFDWixPQUFPLEtBQUssSUFBSTtnQkFDaEIsSUFBSSxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7Z0JBQzlCLENBQUMsT0FBTyxLQUFLLEtBQUssSUFBSSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUU7Z0JBQ3ZELE1BQU0sZ0JBQWdCLEdBQUcsWUFBSyxDQUFDLGVBQVEsQ0FBQyxzQkFBc0IsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQztnQkFDaEYsSUFBSSxVQUFVLEdBQUcsV0FBSSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztnQkFDbkUsSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxVQUFHLEVBQUUsQ0FBQyxFQUFFO29CQUNuQyxVQUFVLEdBQUcsSUFBSSxVQUFHLEdBQUcsVUFBVSxFQUFFLENBQUM7aUJBQ3ZDO2dCQUNELGlCQUFpQixDQUFDLElBQUksQ0FBQyxrQkFBa0IsVUFBVSxNQUFNLENBQUMsQ0FBQzthQUM5RDtTQUNKO1FBQ0QsSUFBSSxpQkFBaUIsQ0FBQyxNQUFNLEVBQUU7WUFDMUIsVUFBVSxDQUFDLGFBQWEsQ0FBQyxnQkFBZ0IsRUFBRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztZQUN2RSxxQkFBcUI7WUFDckIsK0JBQStCO1lBQy9CLHNCQUFzQjtZQUN0QixtQ0FBbUM7WUFDbkMsdUNBQXVDO1lBQ3ZDLE1BQU07U0FDVDtRQUNELE9BQU8sS0FBSyxDQUFDO0lBQ2pCLENBQUMsQ0FBQztBQUNOLENBQUM7QUE5Q0QsZ0NBOENDO0FBQ0Qsa2xGQUFrbEYifQ==