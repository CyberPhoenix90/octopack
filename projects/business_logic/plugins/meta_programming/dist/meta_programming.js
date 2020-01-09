"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('你好世界');
const static_analyser_1 = require("../../../../libraries/static_analyser");
const vm = require("vm");
function metaProgramming(args) {
    return async (model, context) => {
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Evaluating meta programming`);
        for (const file of model.files) {
            if (file.fullPath.endsWith('.ts') ||
                file.fullPath.endsWith('.tsx') ||
                file.fullPath.endsWith('.js') ||
                file.fullPath.endsWith('.jsx')) {
                evaluate(file, model.project, model.allProjects);
            }
        }
        return model;
    };
}
exports.metaProgramming = metaProgramming;
function evaluate(file, project, allProjects) {
    const fm = new static_analyser_1.FileManipulator(file.content);
    fm.forEachComment((text, position) => {
        if (text.includes('#generator(')) {
            let code = text.substring(text.indexOf('#generator(') + 1);
            if (code.endsWith('*/')) {
                code = code.substring(0, code.length - 2);
            }
            const replacement = runModule(code);
            return [
                {
                    start: position.fullStart,
                    end: position.end,
                    replacement
                }
            ];
        }
        else {
            return [];
        }
    });
    fm.applyManipulations();
    file.content = fm.content;
}
function runModule(code) {
    const replacement = [];
    const sandboxContext = {
        compiler: {
            writeLine(line) {
                replacement.push(line);
            }
        }
    };
    vm.createContext(sandboxContext);
    vm.runInContext(`(function ${code})(compiler)`, sandboxContext);
    return replacement.join('\n');
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWV0YV9wcm9ncmFtbWluZy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1ldGFfcHJvZ3JhbW1pbmcudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBS25CLDJFQUF3RTtBQUV4RSx5QkFBeUI7QUFFekIsU0FBZ0IsZUFBZSxDQUFDLElBQWtCO0lBQ2pELE9BQU8sS0FBSyxFQUFFLEtBQXVCLEVBQUUsT0FBc0IsRUFBRSxFQUFFO1FBQ2hFLE9BQU8sQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxjQUFjLENBQUMsSUFBSSw4QkFBOEIsQ0FBQyxDQUFDO1FBQzNGLEtBQUssTUFBTSxJQUFJLElBQUksS0FBSyxDQUFDLEtBQUssRUFBRTtZQUMvQixJQUNDLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQztnQkFDN0IsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsTUFBTSxDQUFDO2dCQUM5QixJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUM7Z0JBQzdCLElBQUksQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxFQUM3QjtnQkFDRCxRQUFRLENBQUMsSUFBSSxFQUFFLEtBQUssQ0FBQyxPQUFPLEVBQUUsS0FBSyxDQUFDLFdBQVcsQ0FBQyxDQUFDO2FBQ2pEO1NBQ0Q7UUFDRCxPQUFPLEtBQUssQ0FBQztJQUNkLENBQUMsQ0FBQztBQUNILENBQUM7QUFmRCwwQ0FlQztBQUVELFNBQVMsUUFBUSxDQUFDLElBQWlCLEVBQUUsT0FBZ0IsRUFBRSxXQUFzQjtJQUM1RSxNQUFNLEVBQUUsR0FBRyxJQUFJLGlDQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQzdDLEVBQUUsQ0FBQyxjQUFjLENBQUMsQ0FBQyxJQUFZLEVBQUUsUUFBdUIsRUFBRSxFQUFFO1FBQzNELElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUMsRUFBRTtZQUNqQyxJQUFJLElBQUksR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsYUFBYSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7WUFDM0QsSUFBSSxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN4QixJQUFJLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQzthQUMxQztZQUNELE1BQU0sV0FBVyxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUNwQyxPQUFPO2dCQUNOO29CQUNDLEtBQUssRUFBRSxRQUFRLENBQUMsU0FBUztvQkFDekIsR0FBRyxFQUFFLFFBQVEsQ0FBQyxHQUFHO29CQUNqQixXQUFXO2lCQUNYO2FBQ0QsQ0FBQztTQUNGO2FBQU07WUFDTixPQUFPLEVBQUUsQ0FBQztTQUNWO0lBQ0YsQ0FBQyxDQUFDLENBQUM7SUFDSCxFQUFFLENBQUMsa0JBQWtCLEVBQUUsQ0FBQztJQUN4QixJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQyxPQUFPLENBQUM7QUFDM0IsQ0FBQztBQUVELFNBQVMsU0FBUyxDQUFDLElBQVk7SUFDOUIsTUFBTSxXQUFXLEdBQWEsRUFBRSxDQUFDO0lBQ2pDLE1BQU0sY0FBYyxHQUFRO1FBQzNCLFFBQVEsRUFBRTtZQUNULFNBQVMsQ0FBQyxJQUFZO2dCQUNyQixXQUFXLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1lBQ3hCLENBQUM7U0FDRDtLQUNELENBQUM7SUFDRixFQUFFLENBQUMsYUFBYSxDQUFDLGNBQWMsQ0FBQyxDQUFDO0lBQ2pDLEVBQUUsQ0FBQyxZQUFZLENBQUMsYUFBYSxJQUFJLGFBQWEsRUFBRSxjQUFjLENBQUMsQ0FBQztJQUVoRSxPQUFPLFdBQVcsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDL0IsQ0FBQyJ9