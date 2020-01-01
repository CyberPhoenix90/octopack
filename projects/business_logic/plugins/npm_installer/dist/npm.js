"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
async function npmInstallPlugin(projects) {
    const promises = [];
    for (const project of projects) {
        promises.push(npmInstall(project));
    }
    await Promise.all(promises);
}
exports.npmInstallPlugin = npmInstallPlugin;
function npmInstall(project, isRetry = false) {
    return new Promise((resolve, reject) => {
        const handle = child_process_1.spawn('npm', ['install'], {
            cwd: project.path
        });
        const stdBuffer = [];
        handle.stdout.on('data', (msg) => {
            stdBuffer.push(msg);
        });
        handle.stderr.on('data', (msg) => {
            stdBuffer.push(msg);
        });
        handle.on('error', (err) => {
            reject(err);
        });
        handle.on('close', () => {
            resolve();
        });
        handle.on('exit', (code) => {
            if (code !== 0) {
                if (isRetry) {
                    console.error(stdBuffer.join(''));
                    reject(code);
                }
                else {
                    npmInstall(project, true).then(resolve, reject);
                }
            }
            else {
                resolve();
            }
        });
    });
}
//# sourceMappingURL=npm.js.map