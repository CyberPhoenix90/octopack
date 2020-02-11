import { OctoPackBuildPlugin, ProjectBuildData, ScriptContext } from 'models';
import { MapLike } from '../../../../../typings/common';
import { parse, join, relative } from 'path';

export function runtime(args: MapLike<any>): OctoPackBuildPlugin {
	return async (model: ProjectBuildData, context: ScriptContext) => {
		let path: string = join(model.project.path, args.out);
		let handleExisting: 'append' | 'replace' | 'prepend' = args.handleExisting ?? 'replace';

		let runtime: string[] = generateRuntime(args, model, path);

		const result = runtime.join('');
		if (await model.fileSystem.exists(path)) {
			let existing: string;
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
		} else {
			await model.fileSystem.writeFile(path, result);
		}

		return model;
	};
}

function generateRuntime(args: MapLike<any>, model: ProjectBuildData, path: string) {
	let runtime: string[] = [args.header ?? ''];
	if (model.project.resolvedConfig.platform === 'browser') {
		generateBrowserRuntime(model, runtime, path);
	} else {
		generateNodeJsRuntime(model, runtime, path);
	}
	if (args.footer) {
		runtime.push(args.footer);
	}
	return runtime;
}

function generateBrowserRuntime(model: ProjectBuildData, runtime: string[], path: string) {
	runtime.push(`
	(function (global, setTimeout) {
		var req, s, head, baseElement, dataMain, src,
			interactiveScript, currentlyAddingScript, mainScript, subPath,
			version = '2.3.6',
			commentRegExp = /\\/\\*[\\s\\S]*?\\*\\/|([^:"'=]|^)\\/\\/.*$/mg,
			cjsRequireRegExp = /[^.]\\s*require\\s*\\(\\s*["']([^'"\\s]+)["']\\s*\\)/g,
			jsSuffixRegExp = /\\.js$/,
			currDirRegExp = /^\\.\\//,
			op = Object.prototype,
			ostring = op.toString,
			hasOwn = op.hasOwnProperty,
			isBrowser = !!(typeof window !== 'undefined' && typeof navigator !== 'undefined' && window.document),
			isWebWorker = !isBrowser && typeof importScripts !== 'undefined',
			readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
						  /^complete$/ : /^(complete|loaded)$/,
			defContextName = '_',
			isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
			contexts = {},
			cfg = {},
			globalDefQueue = [],
			useInteractive = false;

		function commentReplace(match, singlePrefix) {
			return singlePrefix || '';
		}

		function isFunction(it) {
			return ostring.call(it) === '[object Function]';
		}

		function isArray(it) {
			return ostring.call(it) === '[object Array]';
		}

		function each(ary, func) {
			if (ary) {
				var i;
				for (i = 0; i < ary.length; i += 1) {
					if (ary[i] && func(ary[i], i, ary)) {
						break;
					}
				}
			}
		}

		function eachReverse(ary, func) {
			if (ary) {
				var i;
				for (i = ary.length - 1; i > -1; i -= 1) {
					if (ary[i] && func(ary[i], i, ary)) {
						break;
					}
				}
			}
		}

		function hasProp(obj, prop) {
			return hasOwn.call(obj, prop);
		}

		function getOwn(obj, prop) {
			return hasProp(obj, prop) && obj[prop];
		}

		function eachProp(obj, func) {
			var prop;
			for (prop in obj) {
				if (hasProp(obj, prop)) {
					if (func(obj[prop], prop)) {
						break;
					}
				}
			}
		}

		function mixin(target, source, force, deepStringMixin) {
			if (source) {
				eachProp(source, function (value, prop) {
					if (force || !hasProp(target, prop)) {
						if (deepStringMixin && typeof value === 'object' && value &&
							!isArray(value) && !isFunction(value) &&
							!(value instanceof RegExp)) {

							if (!target[prop]) {
								target[prop] = {};
							}
							mixin(target[prop], value, force, deepStringMixin);
						} else {
							target[prop] = value;
						}
					}
				});
			}
			return target;
		}

		function bind(obj, fn) {
			return function () {
				return fn.apply(obj, arguments);
			};
		}

		function scripts() {
			return document.getElementsByTagName('script');
		}

		function defaultOnError(err) {
			throw err;
		}

		//Allow getting a global that is expressed in
		//dot notation, like 'a.b.c'.
		function getGlobal(value) {
			if (!value) {
				return value;
			}
			var g = global;
			each(value.split('.'), function (part) {
				g = g[part];
			});
			return g;
		}

		/**
		 * Constructs an error with a pointer to an URL with more information.
		 * @param {String} id the error ID that maps to an ID on a web page.
		 * @param {String} message human readable error.
		 * @param {Error} [err] the original error, if there is one.
		 *
		 * @returns {Error}
		 */
		function makeError(id, msg, err, requireModules) {
			var e = new Error(msg + '\\nhttps://requirejs.org/docs/errors.html#' + id);
			e.requireType = id;
			e.requireModules = requireModules;
			if (err) {
				e.originalError = err;
			}
			return e;
		}

		if (typeof define !== 'undefined') {
			//If a define is already in play via another AMD loader,
			//do not overwrite.
			return;
		}

		//Allow for a require config object
		if (typeof require !== 'undefined' && !isFunction(require)) {
			//assume it is a config object.
			cfg = require;
			require = undefined;
		}

		function newContext(contextName) {
			var inCheckLoaded, Module, context, handlers,
				checkLoadedTimeoutId,
				config = {
					//Defaults. Do not set a default for map
					//config to speed up normalize(), which
					//will run faster if there is no default.
					waitSeconds: 7,
					baseUrl: './',
					paths: {},
					bundles: {},
					pkgs: {},
					shim: {},
					config: {}
				},
				registry = {},
				//registry of just enabled modules, to speed
				//cycle breaking code when lots of modules
				//are registered, but not activated.
				enabledRegistry = {},
				undefEvents = {},
				defQueue = [],
				defined = {},
				urlFetched = {},
				bundlesMap = {},
				requireCounter = 1,
				unnormalizedCounter = 1;

			/**
			 * Trims the . and .. from an array of path segments.
			 * It will keep a leading path segment if a .. will become
			 * the first path segment, to help with module name lookups,
			 * which act like paths, but can be remapped. But the end result,
			 * all paths that use this function should look normalized.
			 * NOTE: this method MODIFIES the input array.
			 * @param {Array} ary the array of path segments.
			 */
			function trimDots(ary) {
				var i, part;
				for (i = 0; i < ary.length; i++) {
					part = ary[i];
					if (part === '.') {
						ary.splice(i, 1);
						i -= 1;
					} else if (part === '..') {
						// If at the start, or previous value is still ..,
						// keep them so that when converted to a path it may
						// still work when converted to a path, even though
						// as an ID it is less than ideal. In larger point
						// releases, may be better to just kick out an error.
						if (i === 0 || (i === 1 && ary[2] === '..') || ary[i - 1] === '..') {
							continue;
						} else if (i > 0) {
							ary.splice(i - 1, 2);
							i -= 2;
						}
					}
				}
			}

			/**
			 * Given a relative module name, like ./something, normalize it to
			 * a real name that can be mapped to a path.
			 * @param {String} name the relative name
			 * @param {String} baseName a real name that the name arg is relative
			 * to.
			 * @param {Boolean} applyMap apply the map config to the value. Should
			 * only be done if this normalization is for a dependency ID.
			 * @returns {String} normalized name
			 */
			function normalize(name, baseName, applyMap) {
				var pkgMain, mapValue, nameParts, i, j, nameSegment, lastIndex,
					foundMap, foundI, foundStarMap, starI, normalizedBaseParts,
					baseParts = (baseName && baseName.split('/')),
					map = config.map,
					starMap = map && map['*'];

				//Adjust any relative paths.
				if (name) {
					name = name.split('/');
					lastIndex = name.length - 1;

					// If wanting node ID compatibility, strip .js from end
					// of IDs. Have to do this here, and not in nameToUrl
					// because node allows either .js or non .js to map
					// to same file.
					if (config.nodeIdCompat && jsSuffixRegExp.test(name[lastIndex])) {
						name[lastIndex] = name[lastIndex].replace(jsSuffixRegExp, '');
					}

					// Starts with a '.' so need the baseName
					if (name[0].charAt(0) === '.' && baseParts) {
						//Convert baseName to array, and lop off the last part,
						//so that . matches that 'directory' and not name of the baseName's
						//module. For instance, baseName of 'one/two/three', maps to
						//'one/two/three.js', but we want the directory, 'one/two' for
						//this normalization.
						normalizedBaseParts = baseParts.slice(0, baseParts.length - 1);
						name = normalizedBaseParts.concat(name);
					}

					trimDots(name);
					name = name.join('/');
				}

				//Apply map config if available.
				if (applyMap && map && (baseParts || starMap)) {
					nameParts = name.split('/');

					outerLoop: for (i = nameParts.length; i > 0; i -= 1) {
						nameSegment = nameParts.slice(0, i).join('/');

						if (baseParts) {
							//Find the longest baseName segment match in the config.
							//So, do joins on the biggest to smallest lengths of baseParts.
							for (j = baseParts.length; j > 0; j -= 1) {
								mapValue = getOwn(map, baseParts.slice(0, j).join('/'));

								//baseName segment has config, find if it has one for
								//this name.
								if (mapValue) {
									mapValue = getOwn(mapValue, nameSegment);
									if (mapValue) {
										//Match, update name to the new value.
										foundMap = mapValue;
										foundI = i;
										break outerLoop;
									}
								}
							}
						}

						//Check for a star map match, but just hold on to it,
						//if there is a shorter segment match later in a matching
						//config, then favor over this star map.
						if (!foundStarMap && starMap && getOwn(starMap, nameSegment)) {
							foundStarMap = getOwn(starMap, nameSegment);
							starI = i;
						}
					}

					if (!foundMap && foundStarMap) {
						foundMap = foundStarMap;
						foundI = starI;
					}

					if (foundMap) {
						nameParts.splice(0, foundI, foundMap);
						name = nameParts.join('/');
					}
				}

				// If the name points to a package's name, use
				// the package main instead.
				pkgMain = getOwn(config.pkgs, name);

				return pkgMain ? pkgMain : name;
			}

			function removeScript(name) {
				if (isBrowser) {
					each(scripts(), function (scriptNode) {
						if (scriptNode.getAttribute('data-requiremodule') === name &&
								scriptNode.getAttribute('data-requirecontext') === context.contextName) {
							scriptNode.parentNode.removeChild(scriptNode);
							return true;
						}
					});
				}
			}

			function hasPathFallback(id) {
				var pathConfig = getOwn(config.paths, id);
				if (pathConfig && isArray(pathConfig) && pathConfig.length > 1) {
					pathConfig.shift();
					context.require.undef(id);

					context.makeRequire(null, {
						skipMap: true
					})([id]);

					return true;
				}
			}

			function splitPrefix(name) {
				var prefix,
					index = name ? name.indexOf('!') : -1;
				if (index > -1) {
					prefix = name.substring(0, index);
					name = name.substring(index + 1, name.length);
				}
				return [prefix, name];
			}

			/**
			 * Creates a module mapping that includes plugin prefix, module
			 * name, and path. If parentModuleMap is provided it will
			 * also normalize the name via require.normalize()
			 *
			 * @param {String} name the module name
			 * @param {String} [parentModuleMap] parent module map
			 * for the module name, used to resolve relative names.
			 * @param {Boolean} isNormalized: is the ID already normalized.
			 * This is true if this call is done for a define() module ID.
			 * @param {Boolean} applyMap: apply the map config to the ID.
			 * Should only be true if this map is for a dependency.
			 *
			 * @returns {Object}
			 */
			function makeModuleMap(name, parentModuleMap, isNormalized, applyMap) {
				var url, pluginModule, suffix, nameParts,
					prefix = null,
					parentName = parentModuleMap ? parentModuleMap.name : null,
					originalName = name,
					isDefine = true,
					normalizedName = '';

				//If no name, then it means it is a require call, generate an
				//internal name.
				if (!name) {
					isDefine = false;
					name = '_@r' + (requireCounter += 1);
				}

				nameParts = splitPrefix(name);
				prefix = nameParts[0];
				name = nameParts[1];

				if (prefix) {
					prefix = normalize(prefix, parentName, applyMap);
					pluginModule = getOwn(defined, prefix);
				}

				//Account for relative paths if there is a base name.
				if (name) {
					if (prefix) {
						if (isNormalized) {
							normalizedName = name;
						} else if (pluginModule && pluginModule.normalize) {
							//Plugin is loaded, use its normalize method.
							normalizedName = pluginModule.normalize(name, function (name) {
								return normalize(name, parentName, applyMap);
							});
						} else {
							// If nested plugin references, then do not try to
							// normalize, as it will not normalize correctly. This
							// places a restriction on resourceIds, and the longer
							// term solution is not to normalize until plugins are
							// loaded and all normalizations to allow for async
							// loading of a loader plugin. But for now, fixes the
							// common uses. Details in #1131
							normalizedName = name.indexOf('!') === -1 ?
											 normalize(name, parentName, applyMap) :
											 name;
						}
					} else {
						//A regular module.
						normalizedName = normalize(name, parentName, applyMap);

						//Normalized name may be a plugin ID due to map config
						//application in normalize. The map config values must
						//already be normalized, so do not need to redo that part.
						nameParts = splitPrefix(normalizedName);
						prefix = nameParts[0];
						normalizedName = nameParts[1];
						isNormalized = true;

						url = context.nameToUrl(normalizedName);
					}
				}

				//If the id is a plugin id that cannot be determined if it needs
				//normalization, stamp it with a unique ID so two matching relative
				//ids that may conflict can be separate.
				suffix = prefix && !pluginModule && !isNormalized ?
						 '_unnormalized' + (unnormalizedCounter += 1) :
						 '';

				return {
					prefix: prefix,
					name: normalizedName,
					parentMap: parentModuleMap,
					unnormalized: !!suffix,
					url: url,
					originalName: originalName,
					isDefine: isDefine,
					id: (prefix ?
							prefix + '!' + normalizedName :
							normalizedName) + suffix
				};
			}

			function getModule(depMap) {
				var id = depMap.id,
					mod = getOwn(registry, id);

				if (!mod) {
					mod = registry[id] = new context.Module(depMap);
				}

				return mod;
			}

			function on(depMap, name, fn) {
				var id = depMap.id,
					mod = getOwn(registry, id);

				if (hasProp(defined, id) &&
						(!mod || mod.defineEmitComplete)) {
					if (name === 'defined') {
						fn(defined[id]);
					}
				} else {
					mod = getModule(depMap);
					if (mod.error && name === 'error') {
						fn(mod.error);
					} else {
						mod.on(name, fn);
					}
				}
			}

			function onError(err, errback) {
				var ids = err.requireModules,
					notified = false;

				if (errback) {
					errback(err);
				} else {
					each(ids, function (id) {
						var mod = getOwn(registry, id);
						if (mod) {
							//Set error on module, so it skips timeout checks.
							mod.error = err;
							if (mod.events.error) {
								notified = true;
								mod.emit('error', err);
							}
						}
					});

					if (!notified) {
						req.onError(err);
					}
				}
			}

			/**
			 * Internal method to transfer globalQueue items to this context's
			 * defQueue.
			 */
			function takeGlobalQueue() {
				//Push all the globalDefQueue items into the context's defQueue
				if (globalDefQueue.length) {
					each(globalDefQueue, function(queueItem) {
						var id = queueItem[0];
						if (typeof id === 'string') {
							context.defQueueMap[id] = true;
						}
						defQueue.push(queueItem);
					});
					globalDefQueue = [];
				}
			}

			handlers = {
				'require': function (mod) {
					if (mod.require) {
						return mod.require;
					} else {
						return (mod.require = context.makeRequire(mod.map));
					}
				},
				'exports': function (mod) {
					mod.usingExports = true;
					if (mod.map.isDefine) {
						if (mod.exports) {
							return (defined[mod.map.id] = mod.exports);
						} else {
							return (mod.exports = defined[mod.map.id] = {});
						}
					}
				},
				'module': function (mod) {
					if (mod.module) {
						return mod.module;
					} else {
						return (mod.module = {
							id: mod.map.id,
							uri: mod.map.url,
							config: function () {
								return getOwn(config.config, mod.map.id) || {};
							},
							exports: mod.exports || (mod.exports = {})
						});
					}
				}
			};

			function cleanRegistry(id) {
				//Clean up machinery used for waiting modules.
				delete registry[id];
				delete enabledRegistry[id];
			}

			function breakCycle(mod, traced, processed) {
				var id = mod.map.id;

				if (mod.error) {
					mod.emit('error', mod.error);
				} else {
					traced[id] = true;
					each(mod.depMaps, function (depMap, i) {
						var depId = depMap.id,
							dep = getOwn(registry, depId);

						//Only force things that have not completed
						//being defined, so still in the registry,
						//and only if it has not been matched up
						//in the module already.
						if (dep && !mod.depMatched[i] && !processed[depId]) {
							if (getOwn(traced, depId)) {
								mod.defineDep(i, defined[depId]);
								mod.check(); //pass false?
							} else {
								breakCycle(dep, traced, processed);
							}
						}
					});
					processed[id] = true;
				}
			}

			function checkLoaded() {
				var err, usingPathFallback,
					waitInterval = config.waitSeconds * 1000,
					//It is possible to disable the wait interval by using waitSeconds of 0.
					expired = waitInterval && (context.startTime + waitInterval) < new Date().getTime(),
					noLoads = [],
					reqCalls = [],
					stillLoading = false,
					needCycleCheck = true;

				//Do not bother if this call was a result of a cycle break.
				if (inCheckLoaded) {
					return;
				}

				inCheckLoaded = true;

				//Figure out the state of all the modules.
				eachProp(enabledRegistry, function (mod) {
					var map = mod.map,
						modId = map.id;

					//Skip things that are not enabled or in error state.
					if (!mod.enabled) {
						return;
					}

					if (!map.isDefine) {
						reqCalls.push(mod);
					}

					if (!mod.error) {
						//If the module should be executed, and it has not
						//been inited and time is up, remember it.
						if (!mod.inited && expired) {
							if (hasPathFallback(modId)) {
								usingPathFallback = true;
								stillLoading = true;
							} else {
								noLoads.push(modId);
								removeScript(modId);
							}
						} else if (!mod.inited && mod.fetched && map.isDefine) {
							stillLoading = true;
							if (!map.prefix) {
								//No reason to keep looking for unfinished
								//loading. If the only stillLoading is a
								//plugin resource though, keep going,
								//because it may be that a plugin resource
								//is waiting on a non-plugin cycle.
								return (needCycleCheck = false);
							}
						}
					}
				});

				if (expired && noLoads.length) {
					//If wait time expired, throw error of unloaded modules.
					err = makeError('timeout', 'Load timeout for modules: ' + noLoads, null, noLoads);
					err.contextName = context.contextName;
					return onError(err);
				}

				//Not expired, check for a cycle.
				if (needCycleCheck) {
					each(reqCalls, function (mod) {
						breakCycle(mod, {}, {});
					});
				}

				//If still waiting on loads, and the waiting load is something
				//other than a plugin resource, or there are still outstanding
				//scripts, then just try back later.
				if ((!expired || usingPathFallback) && stillLoading) {
					//Something is still waiting to load. Wait for it, but only
					//if a timeout is not already in effect.
					if ((isBrowser || isWebWorker) && !checkLoadedTimeoutId) {
						checkLoadedTimeoutId = setTimeout(function () {
							checkLoadedTimeoutId = 0;
							checkLoaded();
						}, 50);
					}
				}

				inCheckLoaded = false;
			}

			Module = function (map) {
				this.events = getOwn(undefEvents, map.id) || {};
				this.map = map;
				this.shim = getOwn(config.shim, map.id);
				this.depExports = [];
				this.depMaps = [];
				this.depMatched = [];
				this.pluginMaps = {};
				this.depCount = 0;

				/* this.exports this.factory
				   this.depMaps = [],
				   this.enabled, this.fetched
				*/
			};

			Module.prototype = {
				init: function (depMaps, factory, errback, options) {
					options = options || {};

					//Do not do more inits if already done. Can happen if there
					//are multiple define calls for the same module. That is not
					//a normal, common case, but it is also not unexpected.
					if (this.inited) {
						return;
					}

					this.factory = factory;

					if (errback) {
						//Register for errors on this module.
						this.on('error', errback);
					} else if (this.events.error) {
						//If no errback already, but there are error listeners
						//on this module, set up an errback to pass to the deps.
						errback = bind(this, function (err) {
							this.emit('error', err);
						});
					}

					//Do a copy of the dependency array, so that
					//source inputs are not modified. For example
					//"shim" deps are passed in here directly, and
					//doing a direct modification of the depMaps array
					//would affect that config.
					this.depMaps = depMaps && depMaps.slice(0);

					this.errback = errback;

					//Indicate this module has be initialized
					this.inited = true;

					this.ignore = options.ignore;

					//Could have option to init this module in enabled mode,
					//or could have been previously marked as enabled. However,
					//the dependencies are not known until init is called. So
					//if enabled previously, now trigger dependencies as enabled.
					if (options.enabled || this.enabled) {
						//Enable this module and dependencies.
						//Will call this.check()
						this.enable();
					} else {
						this.check();
					}
				},

				defineDep: function (i, depExports) {
					//Because of cycles, defined callback for a given
					//export can be called more than once.
					if (!this.depMatched[i]) {
						this.depMatched[i] = true;
						this.depCount -= 1;
						this.depExports[i] = depExports;
					}
				},

				fetch: function () {
					if (this.fetched) {
						return;
					}
					this.fetched = true;

					context.startTime = (new Date()).getTime();

					var map = this.map;

					//If the manager is for a plugin managed resource,
					//ask the plugin to load it now.
					if (this.shim) {
						context.makeRequire(this.map, {
							enableBuildCallback: true
						})(this.shim.deps || [], bind(this, function () {
							return map.prefix ? this.callPlugin() : this.load();
						}));
					} else {
						//Regular dependency.
						return map.prefix ? this.callPlugin() : this.load();
					}
				},

				load: function () {
					var url = this.map.url;

					//Regular dependency.
					if (!urlFetched[url]) {
						urlFetched[url] = true;
						context.load(this.map.id, url);
					}
				},

				/**
				 * Checks if the module is ready to define itself, and if so,
				 * define it.
				 */
				check: function () {
					if (!this.enabled || this.enabling) {
						return;
					}

					var err, cjsModule,
						id = this.map.id,
						depExports = this.depExports,
						exports = this.exports,
						factory = this.factory;

					if (!this.inited) {
						// Only fetch if not already in the defQueue.
						if (!hasProp(context.defQueueMap, id)) {
							this.fetch();
						}
					} else if (this.error) {
						this.emit('error', this.error);
					} else if (!this.defining) {
						this.defining = true;

						if (this.depCount < 1 && !this.defined) {
							if (isFunction(factory)) {
								if ((this.events.error && this.map.isDefine) ||
									req.onError !== defaultOnError) {
									try {
										exports = context.execCb(id, factory, depExports, exports);
									} catch (e) {
										err = e;
									}
								} else {
									exports = context.execCb(id, factory, depExports, exports);
								}

								if (this.map.isDefine && exports === undefined) {
									cjsModule = this.module;
									if (cjsModule) {
										exports = cjsModule.exports;
									} else if (this.usingExports) {
										//exports already set the defined value.
										exports = this.exports;
									}
								}

								if (err) {
									err.requireMap = this.map;
									err.requireModules = this.map.isDefine ? [this.map.id] : null;
									err.requireType = this.map.isDefine ? 'define' : 'require';
									return onError((this.error = err));
								}

							} else {
								exports = factory;
							}

							this.exports = exports;

							if (this.map.isDefine && !this.ignore) {
								defined[id] = exports;

								if (req.onResourceLoad) {
									var resLoadMaps = [];
									each(this.depMaps, function (depMap) {
										resLoadMaps.push(depMap.normalizedMap || depMap);
									});
									req.onResourceLoad(context, this.map, resLoadMaps);
								}
							}

							//Clean up
							cleanRegistry(id);

							this.defined = true;
						}

						this.defining = false;

						if (this.defined && !this.defineEmitted) {
							this.defineEmitted = true;
							this.emit('defined', this.exports);
							this.defineEmitComplete = true;
						}

					}
				},

				callPlugin: function () {
					var map = this.map,
						id = map.id,
						pluginMap = makeModuleMap(map.prefix);

					this.depMaps.push(pluginMap);

					on(pluginMap, 'defined', bind(this, function (plugin) {
						var load, normalizedMap, normalizedMod,
							bundleId = getOwn(bundlesMap, this.map.id),
							name = this.map.name,
							parentName = this.map.parentMap ? this.map.parentMap.name : null,
							localRequire = context.makeRequire(map.parentMap, {
								enableBuildCallback: true
							});

						if (this.map.unnormalized) {
							if (plugin.normalize) {
								name = plugin.normalize(name, function (name) {
									return normalize(name, parentName, true);
								}) || '';
							}

							normalizedMap = makeModuleMap(map.prefix + '!' + name,
														  this.map.parentMap,
														  true);
							on(normalizedMap,
								'defined', bind(this, function (value) {
									this.map.normalizedMap = normalizedMap;
									this.init([], function () { return value; }, null, {
										enabled: true,
										ignore: true
									});
								}));

							normalizedMod = getOwn(registry, normalizedMap.id);
							if (normalizedMod) {
								this.depMaps.push(normalizedMap);

								if (this.events.error) {
									normalizedMod.on('error', bind(this, function (err) {
										this.emit('error', err);
									}));
								}
								normalizedMod.enable();
							}

							return;
						}

						if (bundleId) {
							this.map.url = context.nameToUrl(bundleId);
							this.load();
							return;
						}

						load = bind(this, function (value) {
							this.init([], function () { return value; }, null, {
								enabled: true
							});
						});

						load.error = bind(this, function (err) {
							this.inited = true;
							this.error = err;
							err.requireModules = [id];

							eachProp(registry, function (mod) {
								if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
									cleanRegistry(mod.map.id);
								}
							});

							onError(err);
						});

						plugin.load(map.name, localRequire, load, config);
					}));
					context.enable(pluginMap, this);
					this.pluginMaps[pluginMap.id] = pluginMap;
				},

				enable: function () {
					enabledRegistry[this.map.id] = this;
					this.enabled = true;
					this.enabling = true;

					each(this.depMaps, bind(this, function (depMap, i) {
						var id, mod, handler;

						if (typeof depMap === 'string') {
							depMap = makeModuleMap(depMap,
												   (this.map.isDefine ? this.map : this.map.parentMap),
												   false,
												   !this.skipMap);
							this.depMaps[i] = depMap;

							handler = getOwn(handlers, depMap.id);

							if (handler) {
								this.depExports[i] = handler(this);
								return;
							}

							this.depCount += 1;

							on(depMap, 'defined', bind(this, function (depExports) {
								if (this.undefed) {
									return;
								}
								this.defineDep(i, depExports);
								this.check();
							}));

							if (this.errback) {
								on(depMap, 'error', bind(this, this.errback));
							} else if (this.events.error) {
								on(depMap, 'error', bind(this, function(err) {
									this.emit('error', err);
								}));
							}
						}

						id = depMap.id;
						mod = registry[id];

						if (!hasProp(handlers, id) && mod && !mod.enabled) {
							context.enable(depMap, this);
						}
					}));

					eachProp(this.pluginMaps, bind(this, function (pluginMap) {
						var mod = getOwn(registry, pluginMap.id);
						if (mod && !mod.enabled) {
							context.enable(pluginMap, this);
						}
					}));

					this.enabling = false;

					this.check();
				},

				on: function (name, cb) {
					var cbs = this.events[name];
					if (!cbs) {
						cbs = this.events[name] = [];
					}
					cbs.push(cb);
				},

				emit: function (name, evt) {
					each(this.events[name], function (cb) {
						cb(evt);
					});
					if (name === 'error') {
						//Now that the error handler was triggered, remove
						//the listeners, since this broken Module instance
						//can stay around for a while in the registry.
						delete this.events[name];
					}
				}
			};

			function callGetModule(args) {
				//Skip modules already defined.
				if (!hasProp(defined, args[0])) {
					getModule(makeModuleMap(args[0], null, true)).init(args[1], args[2]);
				}
			}

			function removeListener(node, func, name, ieName) {
				//Favor detachEvent because of IE9
				//issue, see attachEvent/addEventListener comment elsewhere
				//in this file.
				if (node.detachEvent && !isOpera) {
					//Probably IE. If not it will throw an error, which will be
					//useful to know.
					if (ieName) {
						node.detachEvent(ieName, func);
					}
				} else {
					node.removeEventListener(name, func, false);
				}
			}

			/**
			 * Given an event from a script node, get the requirejs info from it,
			 * and then removes the event listeners on the node.
			 * @param {Event} evt
			 * @returns {Object}
			 */
			function getScriptData(evt) {
				//Using currentTarget instead of target for Firefox 2.0's sake. Not
				//all old browsers will be supported, but this one was easy enough
				//to support and still makes sense.
				var node = evt.currentTarget || evt.srcElement;

				//Remove the listeners once here.
				removeListener(node, context.onScriptLoad, 'load', 'onreadystatechange');
				removeListener(node, context.onScriptError, 'error');

				return {
					node: node,
					id: node && node.getAttribute('data-requiremodule')
				};
			}

			function intakeDefines() {
				var args;

				takeGlobalQueue();

				while (defQueue.length) {
					args = defQueue.shift();
					if (args[0] === null) {
						return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' +
							args[args.length - 1]));
					} else {
						callGetModule(args);
					}
				}
				context.defQueueMap = {};
			}

			context = {
				config: config,
				contextName: contextName,
				registry: registry,
				defined: defined,
				urlFetched: urlFetched,
				defQueue: defQueue,
				defQueueMap: {},
				Module: Module,
				makeModuleMap: makeModuleMap,
				nextTick: req.nextTick,
				onError: onError,

				configure: function (cfg) {
					if (cfg.baseUrl) {
						if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
							cfg.baseUrl += '/';
						}
					}

					if (typeof cfg.urlArgs === 'string') {
						var urlArgs = cfg.urlArgs;
						cfg.urlArgs = function(id, url) {
							return (url.indexOf('?') === -1 ? '?' : '&') + urlArgs;
						};
					}

					var shim = config.shim,
						objs = {
							paths: true,
							bundles: true,
							config: true,
							map: true
						};

					eachProp(cfg, function (value, prop) {
						if (objs[prop]) {
							if (!config[prop]) {
								config[prop] = {};
							}
							mixin(config[prop], value, true, true);
						} else {
							config[prop] = value;
						}
					});

					if (cfg.bundles) {
						eachProp(cfg.bundles, function (value, prop) {
							each(value, function (v) {
								if (v !== prop) {
									bundlesMap[v] = prop;
								}
							});
						});
					}

					if (cfg.shim) {
						eachProp(cfg.shim, function (value, id) {
							//Normalize the structure
							if (isArray(value)) {
								value = {
									deps: value
								};
							}
							if ((value.exports || value.init) && !value.exportsFn) {
								value.exportsFn = context.makeShimExports(value);
							}
							shim[id] = value;
						});
						config.shim = shim;
					}

					if (cfg.packages) {
						each(cfg.packages, function (pkgObj) {
							var location, name;

							pkgObj = typeof pkgObj === 'string' ? {name: pkgObj} : pkgObj;

							name = pkgObj.name;
							location = pkgObj.location;
							if (location) {
								config.paths[name] = pkgObj.location;
							}

							config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main')
										 .replace(currDirRegExp, '')
										 .replace(jsSuffixRegExp, '');
						});
					}

					eachProp(registry, function (mod, id) {
						if (!mod.inited && !mod.map.unnormalized) {
							mod.map = makeModuleMap(id, null, true);
						}
					});

					if (cfg.deps || cfg.callback) {
						context.require(cfg.deps || [], cfg.callback);
					}
				},

				makeShimExports: function (value) {
					function fn() {
						var ret;
						if (value.init) {
							ret = value.init.apply(global, arguments);
						}
						return ret || (value.exports && getGlobal(value.exports));
					}
					return fn;
				},

				makeRequire: function (relMap, options) {
					options = options || {};

					function localRequire(deps, callback, errback) {
						var id, map, requireMod;

						if (options.enableBuildCallback && callback && isFunction(callback)) {
							callback.__requireJsBuild = true;
						}

						if (typeof deps === 'string') {
							if (isFunction(callback)) {
								return onError(makeError('requireargs', 'Invalid require call'), errback);
							}

							if (relMap && hasProp(handlers, deps)) {
								return handlers[deps](registry[relMap.id]);
							}

							if (req.get) {
								return req.get(context, deps, relMap, localRequire);
							}

							map = makeModuleMap(deps, relMap, false, true);
							id = map.id;

							if (!hasProp(defined, id)) {
								return onError(makeError('notloaded', 'Module name "' +
											id +
											'" has not been loaded yet for context: ' +
											contextName +
											(relMap ? '' : '. Use require([])')));
							}
							return defined[id];
						}

						intakeDefines();

						context.nextTick(function () {
							intakeDefines();

							requireMod = getModule(makeModuleMap(null, relMap));

							requireMod.skipMap = options.skipMap;

							requireMod.init(deps, callback, errback, {
								enabled: true
							});

							checkLoaded();
						});

						return localRequire;
					}

					mixin(localRequire, {
						isBrowser: isBrowser,

						toUrl: function (moduleNamePlusExt) {
							var ext,
								index = moduleNamePlusExt.lastIndexOf('.'),
								segment = moduleNamePlusExt.split('/')[0],
								isRelative = segment === '.' || segment === '..';

							if (index !== -1 && (!isRelative || index > 1)) {
								ext = moduleNamePlusExt.substring(index, moduleNamePlusExt.length);
								moduleNamePlusExt = moduleNamePlusExt.substring(0, index);
							}

							return context.nameToUrl(normalize(moduleNamePlusExt,
													relMap && relMap.id, true), ext,  true);
						},

						defined: function (id) {
							return hasProp(defined, makeModuleMap(id, relMap, false, true).id);
						},

						specified: function (id) {
							id = makeModuleMap(id, relMap, false, true).id;
							return hasProp(defined, id) || hasProp(registry, id);
						}
					});

					if (!relMap) {
						localRequire.undef = function (id) {
							//Bind any waiting define() calls to this context,
							//fix for #408
							takeGlobalQueue();

							var map = makeModuleMap(id, relMap, true),
								mod = getOwn(registry, id);

							mod.undefed = true;
							removeScript(id);

							delete defined[id];
							delete urlFetched[map.url];
							delete undefEvents[id];

							eachReverse(defQueue, function(args, i) {
								if (args[0] === id) {
									defQueue.splice(i, 1);
								}
							});
							delete context.defQueueMap[id];

							if (mod) {
								if (mod.events.defined) {
									undefEvents[id] = mod.events;
								}

								cleanRegistry(id);
							}
						};
					}

					return localRequire;
				},

				enable: function (depMap) {
					var mod = getOwn(registry, depMap.id);
					if (mod) {
						getModule(depMap).enable();
					}
				},

				completeLoad: function (moduleName) {
					var found, args, mod,
						shim = getOwn(config.shim, moduleName) || {},
						shExports = shim.exports;

					takeGlobalQueue();

					while (defQueue.length) {
						args = defQueue.shift();
						if (args[0] === null) {
							args[0] = moduleName;
							if (found) {
								break;
							}
							found = true;
						} else if (args[0] === moduleName) {
							found = true;
						}

						callGetModule(args);
					}
					context.defQueueMap = {};

					mod = getOwn(registry, moduleName);

					if (!found && !hasProp(defined, moduleName) && mod && !mod.inited) {
						if (config.enforceDefine && (!shExports || !getGlobal(shExports))) {
							if (hasPathFallback(moduleName)) {
								return;
							} else {
								return onError(makeError('nodefine',
												 'No define call for ' + moduleName,
												 null,
												 [moduleName]));
							}
						} else {
							callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
						}
					}

					checkLoaded();
				},

				nameToUrl: function (moduleName, ext, skipExt) {
					var paths, syms, i, parentModule, url,
						parentPath, bundleId,
						pkgMain = getOwn(config.pkgs, moduleName);

					if (pkgMain) {
						moduleName = pkgMain;
					}

					bundleId = getOwn(bundlesMap, moduleName);

					if (bundleId) {
						return context.nameToUrl(bundleId, ext, skipExt);
					}

					if (req.jsExtRegExp.test(moduleName)) {
						url = moduleName + (ext || '');
					} else {
						paths = config.paths;

						syms = moduleName.split('/');
						for (i = syms.length; i > 0; i -= 1) {
							parentModule = syms.slice(0, i).join('/');

							parentPath = getOwn(paths, parentModule);
							if (parentPath) {
								if (isArray(parentPath)) {
									parentPath = parentPath[0];
								}
								syms.splice(0, i, parentPath);
								break;
							}
						}

						url = syms.join('/');
						url += (ext || (/^data\\:|^blob\\:|\\?/.test(url) || skipExt ? '' : '.js'));
						url = (url.charAt(0) === '/' || url.match(/^[\\w\\+\\.\\-]+:/) ? '' : config.baseUrl) + url;
					}

					return config.urlArgs && !/^blob\\:/.test(url) ?
						   url + config.urlArgs(moduleName, url) : url;
				},

				load: function (id, url) {
					req.load(context, id, url);
				},

				execCb: function (name, callback, args, exports) {
					return callback.apply(exports, args);
				},

				onScriptLoad: function (evt) {
					if (evt.type === 'load' ||
							(readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
						interactiveScript = null;

						var data = getScriptData(evt);
						context.completeLoad(data.id);
					}
				},

				onScriptError: function (evt) {
					var data = getScriptData(evt);
					if (!hasPathFallback(data.id)) {
						var parents = [];
						eachProp(registry, function(value, key) {
							if (key.indexOf('_@r') !== 0) {
								each(value.depMaps, function(depMap) {
									if (depMap.id === data.id) {
										parents.push(key);
										return true;
									}
								});
							}
						});
						return onError(makeError('scripterror', 'Script error for "' + data.id +
												 (parents.length ?
												 '", needed by: ' + parents.join(', ') :
												 '"'), evt, [data.id]));
					}
				}
			};

			context.require = context.makeRequire();
			return context;
		}

		req = window.requirejs = function (deps, callback, errback, optional) {

			var context, config,
				contextName = defContextName;

			if (!isArray(deps) && typeof deps !== 'string') {
				config = deps;
				if (isArray(callback)) {
					deps = callback;
					callback = errback;
					errback = optional;
				} else {
					deps = [];
				}
			}

			if (config && config.context) {
				contextName = config.context;
			}

			context = getOwn(contexts, contextName);
			if (!context) {
				context = contexts[contextName] = req.s.newContext(contextName);
			}

			if (config) {
				context.configure(config);
			}

			return context.require(deps, callback, errback);
		};

		req.config = function (config) {
			return req(config);
		};

		req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
			setTimeout(fn, 4);
		} : function (fn) { fn(); };

		if (!window.require) {
			window.require = req;
		}

		req.version = version;

		req.jsExtRegExp = /^\\/|:|\\?|\\.js$/;
		req.isBrowser = isBrowser;
		s = req.s = {
			contexts: contexts,
			newContext: newContext
		};

		req({});

		each([
			'toUrl',
			'undef',
			'defined',
			'specified'
		], function (prop) {
			req[prop] = function () {
				var ctx = contexts[defContextName];
				return ctx.require[prop].apply(ctx, arguments);
			};
		});

		if (isBrowser) {
			head = s.head = document.getElementsByTagName('head')[0];
			baseElement = document.getElementsByTagName('base')[0];
			if (baseElement) {
				head = s.head = baseElement.parentNode;
			}
		}

		req.onError = defaultOnError;

		req.createNode = function (config, moduleName, url) {
			var node = config.xhtml ?
					document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
					document.createElement('script');
			node.type = config.scriptType || 'text/javascript';
			node.charset = 'utf-8';
			node.async = true;
			return node;
		};

		req.load = function (context, moduleName, url) {
			var config = (context && context.config) || {},
				node;
			if (isBrowser) {
				node = req.createNode(config, moduleName, url);

				node.setAttribute('data-requirecontext', context.contextName);
				node.setAttribute('data-requiremodule', moduleName);

				if (node.attachEvent &&
						!(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
						!isOpera) {
					useInteractive = true;

					node.attachEvent('onreadystatechange', context.onScriptLoad);
				} else {
					node.addEventListener('load', context.onScriptLoad, false);
					node.addEventListener('error', context.onScriptError, false);
				}
				node.src = url;

				if (config.onNodeCreated) {
					config.onNodeCreated(node, config, moduleName, url);
				}

				currentlyAddingScript = node;
				if (baseElement) {
					head.insertBefore(node, baseElement);
				} else {
					head.appendChild(node);
				}
				currentlyAddingScript = null;

				return node;
			} else if (isWebWorker) {
				try {
					setTimeout(function() {}, 0);
					importScripts(url);

					context.completeLoad(moduleName);
				} catch (e) {
					context.onError(makeError('importscripts',
									'importScripts failed for ' +
										moduleName + ' at ' + url,
									e,
									[moduleName]));
				}
			}
		};

		function getInteractiveScript() {
			if (interactiveScript && interactiveScript.readyState === 'interactive') {
				return interactiveScript;
			}

			eachReverse(scripts(), function (script) {
				if (script.readyState === 'interactive') {
					return (interactiveScript = script);
				}
			});
			return interactiveScript;
		}

		if (isBrowser && !cfg.skipDataMain) {
			eachReverse(scripts(), function (script) {
				if (!head) {
					head = script.parentNode;
				}

				dataMain = script.getAttribute('data-main');
				if (dataMain) {
					mainScript = dataMain;

					if (!cfg.baseUrl && mainScript.indexOf('!') === -1) {
						src = mainScript.split('/');
						mainScript = src.pop();
						subPath = src.length ? src.join('/')  + '/' : './';

						cfg.baseUrl = subPath;
					}

					mainScript = mainScript.replace(jsSuffixRegExp, '');

					if (req.jsExtRegExp.test(mainScript)) {
						mainScript = dataMain;
					}

					cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

					return true;
				}
			});
		}

		window.define = function (name, deps, callback) {
			var node, context;

			if (typeof name !== 'string') {
				//Adjust args appropriately
				callback = deps;
				deps = name;
				name = null;
			}

			if (!isArray(deps)) {
				callback = deps;
				deps = null;
			}

			if (!deps && isFunction(callback)) {
				deps = [];
				if (callback.length) {
					callback
						.toString()
						.replace(commentRegExp, commentReplace)
						.replace(cjsRequireRegExp, function (match, dep) {
							deps.push(dep);
						});

					deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
				}
			}


			if (context) {
				context.defQueue.push([name, deps, callback]);
				context.defQueueMap[name] = true;
			} else {
				globalDefQueue.push([name, deps, callback]);
			}
		};

		define.amd = {
			jQuery: true
		};

		//Set up with config info.
		req(cfg);
	}(this, (typeof setTimeout === 'undefined' ? undefined : setTimeout)));
   `);
	runtime.push('\n////\n');
	runtime.push(createImportMap(model, path, model.flags.remapImportSource));
	runtime.push('\n');
	runtime.push(`requirejs.config({paths:importData})`);
	runtime.push('\n');
}

function generateNodeJsRuntime(model: ProjectBuildData, runtime: string[], path: string) {
	if (model.project.projectDependencies.size) {
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

function createImportMap(model: ProjectBuildData, path: string, remap?: string): string {
	const result: string[] = [];
	for (const dep of model.project.projectDependencies) {
		if (remap) {
			result.push(`'${dep.resolvedConfig.name}': '${join(remap, dep.resolvedConfig.name)}'`);
		} else {
			result.push(`'${dep.resolvedConfig.name}': '${relative(parse(path).dir, dep.path)}'`);
		}
	}

	for (const dep of model.project.fileDependencies.keys()) {
		let depPath = model.project.fileDependencies.get(dep);
		if (model.project.resolvedConfig.platform === 'browser') {
			depPath = `${model.project.resolvedConfig.build.bundles[model.bundle].output}/${depPath}`;
			depPath = depPath.endsWith('.js') ? depPath.substring(0, depPath.length - 3) : depPath;
		}
		result.push(`'${dep}': '${depPath}'`);
	}

	return `const importData = {${result.join(',')}}`;
}

function createVirtualFileMap(model: ProjectBuildData, path: string): string {
	const result: string[] = [];
	for (const filePath of model.project.virtualFileImports.keys()) {
		result.push(`'${filePath}': (require, exports, module) => (${model.project.virtualFileImports.get(filePath)})`);
	}
	return `const virtualFiles = {${result.join(',')}}`;
}
