"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
async function npmInstallPlugin(projects) {
    const promises = [];
    for (const project of projects) {
        npmInstall(project);
    }
    await Promise.all(promises);
}
exports.npmInstallPlugin = npmInstallPlugin;
function npmInstall(project) {
    return new Promise((resolve, reject) => {
        const handle = child_process_1.spawn('npm', ['install'], {
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
//# sourceMappingURL=npm.js.map