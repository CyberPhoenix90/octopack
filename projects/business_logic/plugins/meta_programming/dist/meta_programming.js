"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
console.log('你好世界');
const static_analyser_1 = require("static_analyser");
const vm = require("vm");
function metaProgramming(args) {
    return async (model, context) => {
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Evaluating meta programming`);
        for (const file of model.input) {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                evaluate(file, model.project, model.allProjects, model);
            }
        }
        return model;
    };
}
exports.metaProgramming = metaProgramming;
async function evaluate(file, project, allProjects, model) {
    const fm = new static_analyser_1.FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
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
    await model.fileSystem.writeFile(file, fm.content);
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