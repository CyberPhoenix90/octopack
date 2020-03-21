var { define, require } = (() => {
    const pendingDownload = {};
    const defineByNameMap = {};
    const defineByUrlMap = {};
    const config = {
        baseUrl: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')),
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
        if (mod.done) {
            return mod.exports;
        }
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
        mod.done = true;
        mod.definePromiseResolve();
    }
    async function getDependency(mod, dep) {
        if (dep in defineByNameMap) {
            return defineByNameMap[dep].exports;
        }
        let url = resolveUrl(mod.url, dep);
        if (url in pendingDownload) {
            await pendingDownload[url];
        }
        if (url in defineByUrlMap) {
            await defineByUrlMap[url].definePromise;
            return defineByUrlMap[url].exports;
        }
        const promise = download(url);
        pendingDownload[url] = promise;
        await promise;
        delete pendingDownload[url];
        if (url in defineByUrlMap) {
            await defineByUrlMap[url].definePromise;
            return defineByUrlMap[url].exports;
        }
        return undefined;
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
            else if (!dependency.includes('://')) {
                url = join(config.baseUrl, dependency);
            }
            else {
                url = dependency;
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
            done: false,
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
                done: false,
                definePromise: p,
                definePromiseResolve: r,
                exports: {}
            };
            requireFor(mod, files, callback);
        }
        else {
            const id = resolveUrl((_c = context) === null || _c === void 0 ? void 0 : _c.url, files);
            if (files in defineByNameMap) {
                return defineByNameMap[files].exports;
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
        var _a;
        if (c.paths) {
            for (const id in c.paths) {
                if (c.paths[id].startsWith('.')) {
                    //@ts-ignore
                    c.paths[id] = resolveUrl((_a = document.currentScript) === null || _a === void 0 ? void 0 : _a.src, c.paths[id]);
                }
            }
        }
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibW9kdWxlX2xvYWRlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm1vZHVsZV9sb2FkZXIudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBZUEsSUFBSSxFQUFFLE1BQU0sRUFBRSxPQUFPLEVBQUUsR0FBRyxDQUFDLEdBQUcsRUFBRTtJQUMvQixNQUFNLGVBQWUsR0FBcUMsRUFBRSxDQUFDO0lBQzdELE1BQU0sZUFBZSxHQUFxQyxFQUFFLENBQUM7SUFDN0QsTUFBTSxjQUFjLEdBQXFDLEVBQUUsQ0FBQztJQUM1RCxNQUFNLE1BQU0sR0FBVztRQUN0QixPQUFPLEVBQUUsUUFBUSxDQUFDLE1BQU0sR0FBRyxRQUFRLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsUUFBUSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDN0YsS0FBSyxFQUFFLEVBQUU7S0FDVCxDQUFDO0lBQ0YsSUFBSSxPQUFPLEdBQWtCLFNBQVMsQ0FBQztJQUV2QyxTQUFTLE1BQU0sQ0FBQyxJQUFZLEVBQUUsV0FBcUIsRUFBRSxRQUFnQztRQUNwRixJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLElBQUksT0FBTyxXQUFXLEtBQUssVUFBVSxFQUFFO1lBQzdELFFBQVEsR0FBRyxXQUFXLENBQUM7WUFDdkIsV0FBVyxHQUFHLElBQUksQ0FBQztZQUNuQixJQUFJLEdBQUcsU0FBUyxDQUFDO1NBQ2pCO1FBRUQsTUFBTSxHQUFHLEdBQUcsZ0JBQWdCLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDbkMsVUFBVSxDQUFDLEdBQUcsRUFBRSxXQUFXLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDeEMsQ0FBQztJQUNELE1BQU0sQ0FBQyxHQUFHLEdBQUc7UUFDWixNQUFNLEVBQUUsSUFBSTtLQUNaLENBQUM7SUFFRixLQUFLLFVBQVUsVUFBVSxDQUN4QixHQUFrQixFQUNsQixZQUFzQixFQUN0QixRQUFpQzs7UUFFakMsSUFBSSxH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