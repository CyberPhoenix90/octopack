"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const path_1 = require("path");
function npmInstall(args) {
    return async (model, context) => {
        if (await context.fileSystem.exists(path_1.join(model.project.path, 'package.json'))) {
            const pkg = JSON.parse(await context.fileSystem.readFile(path_1.join(model.project.path, 'package.json'), 'utf8'));
            if (pkg.dependencies &&
                Object.keys(pkg.dependencies).length > 0 &&
                !(await isUpToDate(model, context, pkg))) {
                context.uiLogger.info(`[${model.project.resolvedConfig.name}]Installing npm dependencies`);
                await install(model.project);
            }
        }
        return model;
    };
}
exports.npmInstall = npmInstall;
async function isUpToDate(model, context, pkg) {
    if (await context.fileSystem.exists(path_1.join(model.project.path, 'package-lock.json'))) {
        const lockFile = JSON.parse(await context.fileSystem.readFile(path_1.join(model.project.path, 'package-lock.json'), 'utf8'));
        for (const dep of Object.keys(pkg.dependencies)) {
            if (await context.fileSystem.exists(path_1.join(model.project.path, 'node_modules', dep, 'package.json'))) {
                const depPkg = JSON.parse(await context.fileSystem.readFile(path_1.join(model.project.path, 'node_modules', dep, 'package.json'), 'utf8'));
                if (depPkg.version !== lockFile.dependencies[dep].version) {
                    return false;
                }
            }
            else {
                return false;
            }
        }
    }
    else {
        return false;
    }
    return true;
}
async function install(project, isRetry = false) {
    await runCommand('npm', ['install']);
    await runCommand('npm', ['install', '--package-lock-only']);
    function runCommand(cli, args) {
        return new Promise((resolve, reject) => {
            const handle = child_process_1.spawn(cli, args, {
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
                        install(project, true).then(resolve, reject);
                    }
                }
                else {
                    resolve();
                }
            });
        });
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibnBtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibnBtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0EsaURBQXNDO0FBRXRDLCtCQUE0QjtBQUU1QixTQUFnQixVQUFVLENBQUMsSUFBa0I7SUFDNUMsT0FBTyxLQUFLLEVBQUUsS0FBdUIsRUFBRSxPQUFzQixFQUFFLEVBQUU7UUFDaEUsSUFBSSxNQUFNLE9BQU8sQ0FBQyxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsQ0FBQyxFQUFFO1lBQzlFLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxPQUFPLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxXQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsY0FBYyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQztZQUU1RyxJQUNDLEdBQUcsQ0FBQyxZQUFZO2dCQUNoQixNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsQ0FBQyxNQUFNLEdBQUcsQ0FBQztnQkFDeEMsQ0FBQyxDQUFDLE1BQU0sVUFBVSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsRUFDdkM7Z0JBQ0QsT0FBTyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLDhCQUE4QixDQUFDLENBQUM7Z0JBQzNGLE1BQU0sT0FBTyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQzthQUM3QjtTQUNEO1FBQ0QsT0FBTyxLQUFLLENBQUM7SUFDZCxDQUFDLENBQUM7QUFDSCxDQUFDO0FBaEJELGdDQWdCQztBQUVELEtBQUssVUFBVSxVQUFVLENBQUMsS0FBdUIsRUFBRSxPQUFzQixFQUFFLEdBQVE7SUFDbEYsSUFBSSxNQUFNLE9BQU8sQ0FB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