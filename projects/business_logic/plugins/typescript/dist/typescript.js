"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
async function typescriptPlugin(projects) {
    const promises = [];
    for (const project of projects) {
        promises.push(buildProject(project));
    }
    await Promise.all(promises);
}
exports.typescriptPlugin = typescriptPlugin;
function buildProject(project) {
    return new Promise((resolve, reject) => {
        const handle = child_process_1.spawn('tsc', [], {
            stdio: 'inherit',
            cwd: project.path
        });
        handle.on('error', (err) => {
            reject(err);
        });
        handle.on('close', () => {
            resolve();
        });
        handle.on('exit', () => {
            resolve();
        });
    });
}
//# sourceMappingURL=typescript.js.map