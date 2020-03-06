"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function runtime(args) {
    return async (model, context) => {
        var _a;
        let path = path_1.join(model.project.path, args.out);
        let handleExisting = (_a = args.handleExisting, (_a !== null && _a !== void 0 ? _a : 'replace'));
        let runtime = await generateRuntime(args, model, context, path);
        const result = runtime.join('');
        if (await model.fileSystem.exists(path)) {
            let existing;
            switch (handleExisting) {
                case 'append':
                    existing = await model.fileSystem.readFile(path, 'utf8');
                    await model.fileSystem.writeFile(path, `${existing}\n${result}`);
                    break;
                case 'replace':
                    await model.fileSystem.writeFile(path, result);
                    break;
                case 'prepend':
                    existing = await model.fileSystem.readFile(path, 'utf8');
                    await model.fileSystem.writeFile(path, `${result}\n${existing}`);
                    break;
            }
        }
        else {
            await model.fileSystem.writeFile(path, result);
        }
        return model;
    };
}
exports.runtime = runtime;
async function generateRuntime(args, model, context, path) {
    var _a;
    let runtime = [(_a = args.header, (_a !== null && _a !== void 0 ? _a : ''))];
    if (model.project.resolvedConfig.platform === 'browser') {
        await generateBrowserRuntime(model, context, runtime, path);
    }
    else {
        generateNodeJsRuntime(model, runtime, path);
    }
    if (args.footer) {
        runtime.push(args.footer);
    }
    return runtime;
}
async function generateBrowserRuntime(model, context, runtime, path) {
    if (model.project.resolvedConfig.assembly === 'executable') {
        runtime.push(`var { define, require } = (() => {
			const defineByNameMap = {};
			const defineByUrlMap = {};
			const config = {
				baseUrl: location.href.substring(0, location.href.lastIndexOf('/')),
				paths: {}
			};
			let context = undefined;
			function define(name, dependenies, callback) {
				if (Array.isArray(name) && typeof dependenies === 'function') {
					callback = dependenies;
					dependenies = name;
					name = undefined;
				}
				const mod = submitDefinition(name);
				requireFor(mod, dependenies, callback);
			}
			define.amd = {
				jQuery: true
			};
			async function requireFor(mod, dependencies, callback) {
				var _a;
				const args = [];
				for (const dep of dependencies) {
					switch (dep) {
						case 'require':
							args.push(require);
							break;
						case 'exports':
							args.push(mod.exports);
							break;
						case 'module':
							args.push({});
							break;
						default:
							args.push(getDependency(mod, dep));
							break;
					}
				}
				const resolvedDeps = await Promise.all(args);
				context = mod;
				const ret = (_a = callback) === null || _a === void 0 ? void 0 : _a(...resolvedDeps);
				if (ret) {
					mod.exports = ret;
				}
				context = undefined;
				mod.definePromiseResolve();
			}
			async function getDependency(mod, dep) {
				if (dep in defineByNameMap) {
					return defineByNameMap[dep].exports;
				}
				let url = resolveUrl(mod.url, dep);
				if (url in defineByUrlMap) {
					return defineByUrlMap[url].exports;
				}
				await download(url);
				if (url in defineByUrlMap) {
					await defineByUrlMap[url].definePromise;
					return defineByUrlMap[url].exports;
				}
				throw new Error('Script ' + url + ' did not define expected module');
			}
			function download(url) {
				return new Promise((resolve, reject) => {
					const script = document.createElement('script');
					script.addEventListener('load', () => resolve());
					script.addEventListener('error', reject);
					script.src = url;
					document.head.append(script);
				});
			}
			function resolveUrl(sourceUrl = '/', dependency) {
				let url;
				if (sourceUrl.includes('.')) {
					sourceUrl = sourceUrl.substring(0, sourceUrl.lastIndexOf('/'));
				}
				if (dependency.startsWith('..')) {
					const pieces = sourceUrl.split('/');
					while (dependency.startsWith('..') && pieces.length > 0) {
						pieces.pop();
						dependency = dependency.substring(3);
					}
					url = join(pieces.join('/'), dependency);
				}
				else if (dependency.startsWith('.')) {
					url = join(sourceUrl, dependency.substring(2));
				}
				else {
					if (!dependency.startsWith('.') && dependency in config.paths) {
						dependency = config.paths[dependency];
					}
					if (dependency.startsWith('/')) {
						url = join(location.origin, dependency);
					}
					else {
						url = join(config.baseUrl, dependency);
					}
				}
				if (!url.includes('.js')) {
					url += '.js';
				}
				return url;
			}
			function join(a, b) {
				if (a.endsWith('/') && b.startsWith('/')) {
					return a + b.substring(1);
				}
				if (!a.endsWith('/') && !b.startsWith('/')) {
					return a + '/' + b;
				}
				return a + b;
			}
			function submitDefinition(name) {
				var _a, _b, _c;
				//@ts-ignore
				const url = (_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.src;
				if (!url) {
					throw new Error('Unexpected state');
				}
				if (!name) {
					name = url;
				}
				let r;
				const p = new Promise((resolve) => {
					r = resolve;
				});
				const mod = {
					name,
					url,
					definePromise: p,
					definePromiseResolve: r,
					exports: (_c = (_b = defineByUrlMap[url]) === null || _b === void 0 ? void 0 : _b.exports, (_c !== null && _c !== void 0 ? _c : {}))
				};
				defineByNameMap[name] = mod;
				defineByUrlMap[url] = mod;
				return mod;
			}
			function require(files, callback) {
				var _a, _b, _c;
				if (Array.isArray(files)) {
					let r;
					const p = new Promise((resolve) => {
						r = resolve;
					});
					const mod = {
						//@ts-ignore
						name: (_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.src,
						//@ts-ignore
						url: (_b = document.currentScript) === null || _b === void 0 ? void 0 : _b.src,
						definePromise: p,
						definePromiseResolve: r,
						exports: {}
					};
					requireFor(mod, files, callback);
				}
				else {
					const id = resolveUrl((_c = context) === null || _c === void 0 ? void 0 : _c.url, files);
					if (id in defineByNameMap) {
						return defineByNameMap[id].exports;
					}
					else if (id in defineByUrlMap) {
						return defineByUrlMap[id].exports;
					}
					else {
						throw new Error(files + ' is not yet loaded');
					}
				}
			}
			require.config = function (c) {
				for (const key in c) {
					//@ts-ignore
					if (!config[key]) {
						//@ts-ignore
						config[key] = c[key];
					}
					else {
						//@ts-ignore
						Object.assign(config[key], c[key]);
					}
				}
			};
			return {
				define,
				require
			};
		})();
		//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlX2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1vZHVsZV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBY0EsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRTtJQUMvQixNQUFNLGVBQWUsR0FBcUMsRUFBRSxDQUFDO0lBQzdELE1BQU0sY0FBYyxHQUFxQyxFQUFFLENBQUM7SUFDNUQsTUFBTSxNQUFNLEdBQVc7UUFDdEIsT0FBTyxFQUFFLFFBQVEsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNuRSxLQUFLLEVBQUUsRUFBRTtLQUNULENBQUM7SUFDRixJQUFJLE9BQU8sR0FBa0IsU0FBUyxDQUFDO0lBRXZDLFNBQVMsTUFBTSxDQUFDLElBQVksRUFBRSxXQUFxQixFQUFFLFFBQWdDO1FBQ3BGLElBQUksS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsSUFBSSxPQUFPLFdBQVcsS0FBSyxVQUFVLEVBQUU7WUFDN0QsUUFBUSxHQUFHLFdBQVcsQ0FBQztZQUN2QixXQUFXLEdBQUcsSUFBSSxDQUFDO1lBQ25CLElBQUksR0FBRyxTQUFTLENBQUM7U0FDakI7UUFFRCxNQUFNLEdBQUcsR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsQ0FBQztRQUNuQyxVQUFVLENBQUMsR0FBRyxFQUFFLFdBQVcsRUFBRSxRQUFRLENBQUMsQ0FBQztJQUN4QyxDQUFDO0lBQ0QsTUFBTSxDQUFDLEdBQUcsR0FBRztRQUNaLE1BQU0sRUFBRSxJQUFJO0tBQ1osQ0FBQztJQUVGLEtBQUssVUFBVSxVQUFVLENBQ3hCLEdBQWtCLEVBQ2xCLFlBQXNCLEVBQ3RCLFFBQWlDOztRQUVqQyxNQUFNLElBQUksR0FBRyxFQUFFLENBQUM7UUFDaEIsS0FBSyxNQUFNLEdBQUcsSUFBSSxZQUFZLEVB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`);
    }
    runtime.push('\n////\n');
    runtime.push(await createBrowserImportMap(model, context.workspaceRoot));
    runtime.push('\n');
    runtime.push(`require.config({paths:importData})`);
    runtime.push('\n');
}
function generateNodeJsRuntime(model, runtime, path) {
    if (model.project.projectDependencies.size || model.project.virtualFileImports.size) {
        runtime.push(`
${createImportMap(model, path, model.flags.remapImportSource)}
${createVirtualFileMap(model, path)}
const mod = require('module');
const {resolve, relative} = require('path');

const original = mod.prototype.require;
mod.prototype.require = function(path, ...args) {

	let resolvedPath = path;
	if(resolvedPath.startsWith('.')) {
		resolvedPath = relative(__dirname,resolve(module.path, path))
		if(virtualFiles[resolvedPath]) {
			const code = virtualFiles[resolvedPath];
			code(require, exports, module);
			return;
		} else {
			return original.call(this, path, ...args);
		}
	} else if (importData[resolvedPath]) {
		resolvedPath = importData[resolvedPath];
		return original.call(module, resolvedPath, ...args);
	} else {
		return original.call(this, path, ...args);
	}
};
`);
    }
}
function createImportMap(model, path, remap) {
    const result = [];
    for (const dep of model.project.projectDependencies) {
        if (remap) {
            result.push(`'${dep.resolvedConfig.name}': '${path_1.join(remap, dep.resolvedConfig.name)}'`);
        }
        else {
            result.push(`'${dep.resolvedConfig.name}': '${path_1.relative(path_1.parse(path).dir, dep.path)}'`);
        }
    }
    for (const dep of model.project.fileDependencies.keys()) {
        let depPath = model.project.fileDependencies.get(dep);
        result.push(`'${dep}': '${depPath}'`);
    }
    return `const importData = {${result.join(',')}}`;
}
async function createBrowserImportMap(model, workspaceRoot) {
    const result = [];
    for (const dep of model.project.projectDependencies) {
        let output = path_1.join(path_1.relative(workspaceRoot, dep.path), JSON.parse(await model.fileSystem.readFile(path_1.join(dep.path, 'package.json'), 'utf8')).main);
        if (output.endsWith('.js')) {
            output = output.substring(0, output.length - 3);
        }
        result.push(`'${dep.resolvedConfig.name}': '${path_1.join('/', output)}'`);
    }
    for (const dep of model.project.fileDependencies.keys()) {
        let depPath = model.project.fileDependencies.get(dep);
        depPath = `${model.project.resolvedConfig.build.bundles[model.bundle].output}/${depPath}`;
        depPath = depPath.endsWith('.js') ? depPath.substring(0, depPath.length - 3) : depPath;
        result.push(`'${dep}': '${depPath}'`);
    }
    return `const importData = {${result.join(',')}}`;
}
function createVirtualFileMap(model, path) {
    const result = [];
    for (const filePath of model.project.virtualFileImports.keys()) {
        result.push(`'${filePath}': (require, exports, module) => (${model.project.virtualFileImports.get(filePath)})`);
    }
    return `const virtualFiles = {${result.join(',')}}`;
}