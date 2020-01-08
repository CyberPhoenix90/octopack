"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('hello world');
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
//# sourceMappingURL=meta_programming.js.map