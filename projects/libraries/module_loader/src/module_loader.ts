//@ignore
interface Config {
	baseUrl: string;
	paths: { [key: string]: string };
}

interface DefinedModule {
	definePromise: Promise<void>;
	definePromiseResolve: () => void;
	name: string;
	url: string;
	exports: any;
	done: boolean;
}

var { define, require } = (() => {
	const pendingDownload: { [key: string]: Promise<void> } = {};
	const defineByNameMap: { [key: string]: DefinedModule } = {};
	const defineByUrlMap: { [key: string]: DefinedModule } = {};
	const config: Config = {
		baseUrl: location.origin + location.pathname.substring(0, location.pathname.lastIndexOf('/')),
		paths: {}
	};
	let context: DefinedModule = undefined;

	function define(name: string, dependenies: string[], callback?: (...args: []) => void) {
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

	async function requireFor(
		mod: DefinedModule,
		dependencies: string[],
		callback: (...args: any[]) => any
	): Promise<void> {
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
		const ret = callback?.(...resolvedDeps);
		if (ret) {
			mod.exports = ret;
		}
		context = undefined;
		mod.done = true;
		mod.definePromiseResolve();
	}

	async function getDependency(mod: DefinedModule, dep: string): Promise<any> {
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

	function download(url: string): Promise<void> {
		return new Promise((resolve, reject) => {
			const script = document.createElement('script');
			script.addEventListener('load', () => resolve());
			script.addEventListener('error', reject);
			script.src = url;
			document.head.append(script);
		});
	}

	function resolveUrl(sourceUrl: string = '/', dependency: string): string {
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
		} else if (dependency.startsWith('.')) {
			url = join(sourceUrl, dependency.substring(2));
		} else {
			if (!dependency.startsWith('.') && dependency in config.paths) {
				dependency = config.paths[dependency];
			}
			if (dependency.startsWith('/')) {
				url = join(location.origin, dependency);
			} else if (!dependency.includes('://')) {
				url = join(config.baseUrl, dependency);
			} else {
				url = dependency;
			}
		}

		if (!url.includes('.js')) {
			url += '.js';
		}
		return url;
	}

	function join(a: string, b: string) {
		if (a.endsWith('/') && b.startsWith('/')) {
			return a + b.substring(1);
		}
		if (!a.endsWith('/') && !b.startsWith('/')) {
			return a + '/' + b;
		}
		return a + b;
	}

	function submitDefinition(name: string): DefinedModule {
		//@ts-ignore
		const url = document.currentScript?.src;
		if (!url) {
			throw new Error('Unexpected state');
		}
		if (!name) {
			name = url;
		}

		let r;
		const p = new Promise<void>((resolve) => {
			r = resolve;
		});

		const mod: DefinedModule = {
			name,
			url,
			done: false,
			definePromise: p,
			definePromiseResolve: r,
			exports: defineByUrlMap[url]?.exports ?? {}
		};

		defineByNameMap[name] = mod;
		defineByUrlMap[url] = mod;

		return mod;
	}

	function require(files: string[] | string, callback?: (...args: any[]) => void) {
		if (Array.isArray(files)) {
			let r;
			const p = new Promise<void>((resolve) => {
				r = resolve;
			});
			const mod: DefinedModule = {
				//@ts-ignore
				name: document.currentScript?.src,
				//@ts-ignore
				url: document.currentScript?.src,
				done: false,
				definePromise: p,
				definePromiseResolve: r,
				exports: {}
			};
			requireFor(mod, files, callback);
		} else {
			const id = resolveUrl(context?.url, files);
			if (files in defineByNameMap) {
				return defineByNameMap[files].exports;
			} else if (id in defineByUrlMap) {
				return defineByUrlMap[id].exports;
			} else {
				throw new Error(files + ' is not yet loaded');
			}
		}
	}

	require.config = function(c: Config) {
		if (c.paths) {
			for (const id in c.paths) {
				if (c.paths[id].startsWith('.')) {
					//@ts-ignore
					c.paths[id] = resolveUrl(document.currentScript?.src, c.paths[id]);
				}
			}
		}

		for (const key in c) {
			//@ts-ignore
			if (!config[key]) {
				//@ts-ignore
				config[key] = c[key];
			} else {
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
