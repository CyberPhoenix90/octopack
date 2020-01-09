"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
async function outputPhase(model, context) {
    for (const p of model.projectsBuildData) {
        const base = findLowestCommonFolder(Object.keys(p.outFiles));
        for (const file of Object.values(p.outFiles)) {
            await context.fileSystem.writeFile(path_1.join(p.project.path, p.project.resolvedConfig.build.bundles[p.bundle].output, path_1.relative(base, file.fullPath)), file.content);
        }
    }
    return model;
}
exports.outputPhase = outputPhase;
function findLowestCommonFolder(files) {
    if (files.length === 0) {
        return '';
    }
    let candidate = path_1.parse(files[0]).dir;
    for (let i = 1; i < files.length; i++) {
        while (!isChildOf(path_1.parse(files[i]).dir, candidate)) {
            if (candidate === '/') {
                throw new Error('Could not determine common folder between files in compilation');
            }
            candidate = path_1.join(candidate, '..');
        }
    }
    return candidate;
}
function isChildOf(file, folder) {
    while (file !== '/') {
        if (file === folder) {
            return true;
        }
        else {
            file = path_1.join(file, '..');
        }
    }
    return file === folder;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib3V0cHV0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsib3V0cHV0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsK0JBQTZDO0FBRXRDLEtBQUssVUFBVSxXQUFXLENBQUMsS0FBb0IsRUFBRSxPQUFzQjtJQUM3RSxLQUFLLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxpQkFBaUIsRUFBRTtRQUN4QyxNQUFNLElBQUksR0FBRyxzQkFBc0IsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDO1FBQzdELEtBQUssTUFBTSxJQUFJLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUU7WUFDN0MsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FDakMsV0FBSSxDQUNILENBQUMsQ0FBQyxPQUFPLENBQUMsSUFBSSxFQUNkLENBQUMsQ0FBQyxPQUFPLENBQUMsY0FBYyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLE1BQU0sRUFDdkQsZUFBUSxDQUFDLElBQUksRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQzdCLEVBQ0QsSUFBSSxDQUFDLE9BQU8sQ0FDWixDQUFDO1NBQ0Y7S0FDRDtJQUVELE9BQU8sS0FBSyxDQUFDO0FBQ2QsQ0FBQztBQWhCRCxrQ0FnQkM7QUFFRCxTQUFTLHNCQUFzQixDQUFDLEtBQWU7SUFDOUMsSUFBSSxLQUFLLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUN2QixPQUFPLEVBQUUsQ0FBQztLQUNWO0lBRUQsSUFBSSxTQUFTLEdBQUcsWUFBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQztJQUNwQyxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRTtRQUN0QyxPQUFPLENBQUMsU0FBUyxDQUFDLFlBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsU0FBUyxDQUFDLEVBQUU7WUFDbEQsSUFBSSxTQUFTLEtBQUssR0FBRyxFQUFFO2dCQUN0QixNQUFNLElBQUksS0FBSyxDQUFDLGdFQUFnRSxDQUFDLENBQUM7YUFDbEY7WUFDRCxTQUFTLEdBQUcsV0FBSSxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsQ0FBQztTQUNsQztLQUNEO0lBRUQsT0FBTyxTQUFTLENBQUM7QUFDbEIsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLElBQVksRUFBRSxNQUFjO0lBQzlDLE9BQU8sSUFBSSxLQUFLLEdBQUcsRUFBRTtRQUNwQixJQUFJLElBQUksS0FBSyxNQUFNLEVBQUU7WUFDcEIsT0FBTyxJQUFJLENBQUM7U0FDWjthQUFNO1lBQ04sSUFBSSxHQUFHLFdBQUksQ0FBQyxJQUFJLEVBQUUsSUFBSSxDQUFDLENBQUM7U0FDeEI7S0FDRDtJQUVELE9BQU8sSUFBSSxLQUFLLE1BQU0sQ0FBQztBQUN4QixDQUFDIn0=