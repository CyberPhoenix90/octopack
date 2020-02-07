"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
function runtime(args) {
    return async (model, context) => {
        var _a;
        let path = path_1.join(model.project.path, args.out);
        let handleExisting = (_a = args.handleExisting, (_a !== null && _a !== void 0 ? _a : 'replace'));
        let runtime = generateRuntime(args, model, path);
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
function generateRuntime(args, model, path) {
    var _a;
    let runtime = [(_a = args.header, (_a !== null && _a !== void 0 ? _a : ''))];
    if (model.project.resolvedConfig.platform === 'browser') {
        generateBrowserRuntime(model, runtime, path);
    }
    else {
        generateNodeJsRuntime(model, runtime, path);
    }
    if (args.footer) {
        runtime.push(args.footer);
    }
    return runtime;
}
function generateBrowserRuntime(model, runtime, path) {
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
function generateNodeJsRuntime(model, runtime, path) {
    if (model.project.projectDependencies.size) {
        runtime.push(`
${createImportMap(model, path, model.flags.remapImportSource)}
const mod = require('module');

const original = mod.prototype.require;
mod.prototype.require = function(path, ...args) {
	if (importData[path]) {
		path = importData[path];
		return original.call(module, path, ...args);
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
        if (model.project.resolvedConfig.platform === 'browser') {
            depPath = `${model.project.resolvedConfig.build.bundles[model.bundle].output}/${depPath}`;
            depPath = depPath.endsWith('.js') ? depPath.substring(0, depPath.length - 3) : depPath;
        }
        result.push(`'${dep}': '${depPath}'`);
    }
    return `const importData = {${result.join(',')}}`;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJydW50aW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcGF0aF8xID0gcmVxdWlyZShcInBhdGhcIik7XG5mdW5jdGlvbiBydW50aW1lKGFyZ3MpIHtcbiAgICByZXR1cm4gYXN5bmMgKG1vZGVsLCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgbGV0IHBhdGggPSBwYXRoXzEuam9pbihtb2RlbC5wcm9qZWN0LnBhdGgsIGFyZ3Mub3V0KTtcbiAgICAgICAgbGV0IGhhbmRsZUV4aXN0aW5nID0gKF9hID0gYXJncy5oYW5kbGVFeGlzdGluZywgKF9hICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6ICdyZXBsYWNlJykpO1xuICAgICAgICBsZXQgcnVudGltZSA9IGdlbmVyYXRlUnVudGltZShhcmdzLCBtb2RlbCwgcGF0aCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJ1bnRpbWUuam9pbignJyk7XG4gICAgICAgIGlmIChhd2FpdCBtb2RlbC5maWxlU3lzdGVtLmV4aXN0cyhwYXRoKSkge1xuICAgICAgICAgICAgbGV0IGV4aXN0aW5nO1xuICAgICAgICAgICAgc3dpdGNoIChoYW5kbGVFeGlzdGluZykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FwcGVuZCc6XG4gICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nID0gYXdhaXQgbW9kZWwuZmlsZVN5c3RlbS5yZWFkRmlsZShwYXRoLCAndXRmOCcpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBtb2RlbC5maWxlU3lzdGVtLndyaXRlRmlsZShwYXRoLCBgJHtleGlzdGluZ31cXG4ke3Jlc3VsdH1gKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmVwbGFjZSc6XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG1vZGVsLmZpbGVTeXN0ZW0ud3JpdGVGaWxlKHBhdGgsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3ByZXBlbmQnOlxuICAgICAgICAgICAgICAgICAgICBleGlzdGluZyA9IGF3YWl0IG1vZGVsLmZpbGVTeXN0ZW0ucmVhZEZpbGUocGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbW9kZWwuZmlsZVN5c3RlbS53cml0ZUZpbGUocGF0aCwgYCR7cmVzdWx0fVxcbiR7ZXhpc3Rpbmd9YCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgbW9kZWwuZmlsZVN5c3RlbS53cml0ZUZpbGUocGF0aCwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgfTtcbn1cbmV4cG9ydHMucnVudGltZSA9IHJ1bnRpbWU7XG5mdW5jdGlvbiBnZW5lcmF0ZVJ1bnRpbWUoYXJncywgbW9kZWwsIHBhdGgpIHtcbiAgICB2YXIgX2E7XG4gICAgbGV0IHJ1bnRpbWUgPSBbKF9hID0gYXJncy5oZWFkZXIsIChfYSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAnJykpXTtcbiAgICBpZiAobW9kZWwucHJvamVjdC5yZXNvbHZlZENvbmZpZy5wbGF0Zm9ybSA9PT0gJ2Jyb3dzZXInKSB7XG4gICAgICAgIGdlbmVyYXRlQnJvd3NlclJ1bnRpbWUobW9kZWwsIHJ1bnRpbWUsIHBhdGgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ2VuZXJhdGVOb2RlSnNSdW50aW1lKG1vZGVsLCBydW50aW1lLCBwYXRoKTtcbiAgICB9XG4gICAgaWYgKGFyZ3MuZm9vdGVyKSB7XG4gICAgICAgIHJ1bnRpbWUucHVzaChhcmdzLmZvb3Rlcik7XG4gICAgfVxuICAgIHJldHVybiBydW50aW1lO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVCcm93c2VyUnVudGltZShtb2RlbCwgcnVudGltZSwgcGF0aCkge1xuICAgIHJ1bnRpbWUucHVzaChgXG5cdChmdW5jdGlvbiAoZ2xvYmFsLCBzZXRUaW1lb3V0KSB7XG5cdFx0dmFyIHJlcSwgcywgaGVhZCwgYmFzZUVsZW1lbnQsIGRhdGFNYWluLCBzcmMsXG5cdFx0XHRpbnRlcmFjdGl2ZVNjcmlwdCwgY3VycmVudGx5QWRkaW5nU2NyaXB0LCBtYWluU2NyaXB0LCBzdWJQYXRoLFxuXHRcdFx0dmVyc2lvbiA9ICcyLjMuNicsXG5cdFx0XHRjb21tZW50UmVnRXhwID0gL1xcXFwvXFxcXCpbXFxcXHNcXFxcU10qP1xcXFwqXFxcXC98KFteOlwiJz1dfF4pXFxcXC9cXFxcLy4qJC9tZyxcblx0XHRcdGNqc1JlcXVpcmVSZWdFeHAgPSAvW14uXVxcXFxzKnJlcXVpcmVcXFxccypcXFxcKFxcXFxzKltcIiddKFteJ1wiXFxcXHNdKylbXCInXVxcXFxzKlxcXFwpL2csXG5cdFx0XHRqc1N1ZmZpeFJlZ0V4cCA9IC9cXFxcLmpzJC8sXG5cdFx0XHRjdXJyRGlyUmVnRXhwID0gL15cXFxcLlxcXFwvLyxcblx0XHRcdG9wID0gT2JqZWN0LnByb3RvdHlwZSxcblx0XHRcdG9zdHJpbmcgPSBvcC50b1N0cmluZyxcblx0XHRcdGhhc093biA9IG9wLmhhc093blByb3BlcnR5LFxuXHRcdFx0aXNCcm93c2VyID0gISEodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50KSxcblx0XHRcdGlzV2ViV29ya2VyID0gIWlzQnJvd3NlciAmJiB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcsXG5cdFx0XHRyZWFkeVJlZ0V4cCA9IGlzQnJvd3NlciAmJiBuYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdQTEFZU1RBVElPTiAzJyA/XG5cdFx0XHRcdFx0XHQgIC9eY29tcGxldGUkLyA6IC9eKGNvbXBsZXRlfGxvYWRlZCkkLyxcblx0XHRcdGRlZkNvbnRleHROYW1lID0gJ18nLFxuXHRcdFx0aXNPcGVyYSA9IHR5cGVvZiBvcGVyYSAhPT0gJ3VuZGVmaW5lZCcgJiYgb3BlcmEudG9TdHJpbmcoKSA9PT0gJ1tvYmplY3QgT3BlcmFdJyxcblx0XHRcdGNvbnRleHRzID0ge30sXG5cdFx0XHRjZmcgPSB7fSxcblx0XHRcdGdsb2JhbERlZlF1ZXVlID0gW10sXG5cdFx0XHR1c2VJbnRlcmFjdGl2ZSA9IGZhbHNlO1xuXG5cdFx0ZnVuY3Rpb24gY29tbWVudFJlcGxhY2UobWF0Y2gsIHNpbmdsZVByZWZpeCkge1xuXHRcdFx0cmV0dXJuIHNpbmdsZVByZWZpeCB8fCAnJztcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBpc0Z1bmN0aW9uKGl0KSB7XG5cdFx0XHRyZXR1cm4gb3N0cmluZy5jYWxsKGl0KSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBpc0FycmF5KGl0KSB7XG5cdFx0XHRyZXR1cm4gb3N0cmluZy5jYWxsKGl0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBlYWNoKGFyeSwgZnVuYykge1xuXHRcdFx0aWYgKGFyeSkge1xuXHRcdFx0XHR2YXIgaTtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGFyeS5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGlmIChhcnlbaV0gJiYgZnVuYyhhcnlbaV0sIGksIGFyeSkpIHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGVhY2hSZXZlcnNlKGFyeSwgZnVuYykge1xuXHRcdFx0aWYgKGFyeSkge1xuXHRcdFx0XHR2YXIgaTtcblx0XHRcdFx0Zm9yIChpID0gYXJ5Lmxlbmd0aCAtIDE7IGkgPiAtMTsgaSAtPSAxKSB7XG5cdFx0XHRcdFx0aWYgKGFyeVtpXSAmJiBmdW5jKGFyeVtpXSwgaSwgYXJ5KSkge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0ZnVuY3Rpb24gaGFzUHJvcChvYmosIHByb3ApIHtcblx0XHRcdHJldHVybiBoYXNPd24uY2FsbChvYmosIHByb3ApO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGdldE93bihvYmosIHByb3ApIHtcblx0XHRcdHJldHVybiBoYXNQcm9wKG9iaiwgcHJvcCkgJiYgb2JqW3Byb3BdO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGVhY2hQcm9wKG9iaiwgZnVuYykge1xuXHRcdFx0dmFyIHByb3A7XG5cdFx0XHRmb3IgKHByb3AgaW4gb2JqKSB7XG5cdFx0XHRcdGlmIChoYXNQcm9wKG9iaiwgcHJvcCkpIHtcblx0XHRcdFx0XHRpZiAoZnVuYyhvYmpbcHJvcF0sIHByb3ApKSB7XG5cdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cblx0XHRmdW5jdGlvbiBtaXhpbih0YXJnZXQsIHNvdXJjZSwgZm9yY2UsIGRlZXBTdHJpbmdNaXhpbikge1xuXHRcdFx0aWYgKHNvdXJjZSkge1xuXHRcdFx0XHRlYWNoUHJvcChzb3VyY2UsIGZ1bmN0aW9uICh2YWx1ZSwgcHJvcCkge1xuXHRcdFx0XHRcdGlmIChmb3JjZSB8fCAhaGFzUHJvcCh0YXJnZXQsIHByb3ApKSB7XG5cdFx0XHRcdFx0XHRpZiAoZGVlcFN0cmluZ01peGluICYmIHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcgJiYgdmFsdWUgJiZcblx0XHRcdFx0XHRcdFx0IWlzQXJyYXkodmFsdWUpICYmICFpc0Z1bmN0aW9uKHZhbHVlKSAmJlxuXHRcdFx0XHRcdFx0XHQhKHZhbHVlIGluc3RhbmNlb2YgUmVnRXhwKSkge1xuXG5cdFx0XHRcdFx0XHRcdGlmICghdGFyZ2V0W3Byb3BdKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGFyZ2V0W3Byb3BdID0ge307XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0bWl4aW4odGFyZ2V0W3Byb3BdLCB2YWx1ZSwgZm9yY2UsIGRlZXBTdHJpbmdNaXhpbik7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHR0YXJnZXRbcHJvcF0gPSB2YWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0pO1xuXHRcdFx0fVxuXHRcdFx0cmV0dXJuIHRhcmdldDtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBiaW5kKG9iaiwgZm4pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBmbi5hcHBseShvYmosIGFyZ3VtZW50cyk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHNjcmlwdHMoKSB7XG5cdFx0XHRyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGRlZmF1bHRPbkVycm9yKGVycikge1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblxuXHRcdC8vQWxsb3cgZ2V0dGluZyBhIGdsb2JhbCB0aGF0IGlzIGV4cHJlc3NlZCBpblxuXHRcdC8vZG90IG5vdGF0aW9uLCBsaWtlICdhLmIuYycuXG5cdFx0ZnVuY3Rpb24gZ2V0R2xvYmFsKHZhbHVlKSB7XG5cdFx0XHRpZiAoIXZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdHZhciBnID0gZ2xvYmFsO1xuXHRcdFx0ZWFjaCh2YWx1ZS5zcGxpdCgnLicpLCBmdW5jdGlvbiAocGFydCkge1xuXHRcdFx0XHRnID0gZ1twYXJ0XTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ29uc3RydWN0cyBhbiBlcnJvciB3aXRoIGEgcG9pbnRlciB0byBhbiBVUkwgd2l0aCBtb3JlIGluZm9ybWF0aW9uLlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCB0aGUgZXJyb3IgSUQgdGhhdCBtYXBzIHRvIGFuIElEIG9uIGEgd2ViIHBhZ2UuXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgaHVtYW4gcmVhZGFibGUgZXJyb3IuXG5cdFx0ICogQHBhcmFtIHtFcnJvcn0gW2Vycl0gdGhlIG9yaWdpbmFsIGVycm9yLCBpZiB0aGVyZSBpcyBvbmUuXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7RXJyb3J9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbWFrZUVycm9yKGlkLCBtc2csIGVyciwgcmVxdWlyZU1vZHVsZXMpIHtcblx0XHRcdHZhciBlID0gbmV3IEVycm9yKG1zZyArICdcXFxcbmh0dHBzOi8vcmVxdWlyZWpzLm9yZy9kb2NzL2Vycm9ycy5odG1sIycgKyBpZCk7XG5cdFx0XHRlLnJlcXVpcmVUeXBlID0gaWQ7XG5cdFx0XHRlLnJlcXVpcmVNb2R1bGVzID0gcmVxdWlyZU1vZHVsZXM7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdGUub3JpZ2luYWxFcnJvciA9IGVycjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBlO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Ly9JZiBhIGRlZmluZSBpcyBhbHJlYWR5IGluIHBsYXkgdmlhIGFub3RoZXIgQU1EIGxvYWRlcixcblx0XHRcdC8vZG8gbm90IG92ZXJ3cml0ZS5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvL0FsbG93IGZvciBhIHJlcXVpcmUgY29uZmlnIG9iamVjdFxuXHRcdGlmICh0eXBlb2YgcmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCcgJiYgIWlzRnVuY3Rpb24ocmVxdWlyZSkpIHtcblx0XHRcdC8vYXNzdW1lIGl0IGlzIGEgY29uZmlnIG9iamVjdC5cblx0XHRcdGNmZyA9IHJlcXVpcmU7XG5cdFx0XHRyZXF1aXJlID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG5ld0NvbnRleHQoY29udGV4dE5hbWUpIHtcblx0XHRcdHZhciBpbkNoZWNrTG9hZGVkLCBNb2R1bGUsIGNvbnRleHQsIGhhbmRsZXJzLFxuXHRcdFx0XHRjaGVja0xvYWRlZFRpbWVvdXRJZCxcblx0XHRcdFx0Y29uZmlnID0ge1xuXHRcdFx0XHRcdC8vRGVmYXVsdHMuIERvIG5vdCBzZXQgYSBkZWZhdWx0IGZvciBtYXBcblx0XHRcdFx0XHQvL2NvbmZpZyB0byBzcGVlZCB1cCBub3JtYWxpemUoKSwgd2hpY2hcblx0XHRcdFx0XHQvL3dpbGwgcnVuIGZhc3RlciBpZiB0aGVyZSBpcyBubyBkZWZhdWx0LlxuXHRcdFx0XHRcdHdhaXRTZWNvbmRzOiA3LFxuXHRcdFx0XHRcdGJhc2VVcmw6ICcuLycsXG5cdFx0XHRcdFx0cGF0aHM6IHt9LFxuXHRcdFx0XHRcdGJ1bmRsZXM6IHt9LFxuXHRcdFx0XHRcdHBrZ3M6IHt9LFxuXHRcdFx0XHRcdHNoaW06IHt9LFxuXHRcdFx0XHRcdGNvbmZpZzoge31cblx0XHRcdFx0fSxcblx0XHRcdFx0cmVnaXN0cnkgPSB7fSxcblx0XHRcdFx0Ly9yZWdpc3RyeSBvZiBqdXN0IGVuYWJsZWQgbW9kdWxlcywgdG8gc3BlZWRcblx0XHRcdFx0Ly9jeWNsZSBicmVha2luZyBjb2RlIHdoZW4gbG90cyBvZiBtb2R1bGVzXG5cdFx0XHRcdC8vYXJlIHJlZ2lzdGVyZWQsIGJ1dCBub3QgYWN0aXZhdGVkLlxuXHRcdFx0XHRlbmFibGVkUmVnaXN0cnkgPSB7fSxcblx0XHRcdFx0dW5kZWZFdmVudHMgPSB7fSxcblx0XHRcdFx0ZGVmUXVldWUgPSBbXSxcblx0XHRcdFx0ZGVmaW5lZCA9IHt9LFxuXHRcdFx0XHR1cmxGZXRjaGVkID0ge30sXG5cdFx0XHRcdGJ1bmRsZXNNYXAgPSB7fSxcblx0XHRcdFx0cmVxdWlyZUNvdW50ZXIgPSAxLFxuXHRcdFx0XHR1bm5vcm1hbGl6ZWRDb3VudGVyID0gMTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUcmltcyB0aGUgLiBhbmQgLi4gZnJvbSBhbiBhcnJheSBvZiBwYXRoIHNlZ21lbnRzLlxuXHRcdFx0ICogSXQgd2lsbCBrZWVwIGEgbGVhZGluZyBwYXRoIHNlZ21lbnQgaWYgYSAuLiB3aWxsIGJlY29tZVxuXHRcdFx0ICogdGhlIGZpcnN0IHBhdGggc2VnbWVudCwgdG8gaGVscCB3aXRoIG1vZHVsZSBuYW1lIGxvb2t1cHMsXG5cdFx0XHQgKiB3aGljaCBhY3QgbGlrZSBwYXRocywgYnV0IGNhbiBiZSByZW1hcHBlZC4gQnV0IHRoZSBlbmQgcmVzdWx0LFxuXHRcdFx0ICogYWxsIHBhdGhzIHRoYXQgdXNlIHRoaXMgZnVuY3Rpb24gc2hvdWxkIGxvb2sgbm9ybWFsaXplZC5cblx0XHRcdCAqIE5PVEU6IHRoaXMgbWV0aG9kIE1PRElGSUVTIHRoZSBpbnB1dCBhcnJheS5cblx0XHRcdCAqIEBwYXJhbSB7QXJyYXl9IGFyeSB0aGUgYXJyYXkgb2YgcGF0aCBzZWdtZW50cy5cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gdHJpbURvdHMoYXJ5KSB7XG5cdFx0XHRcdHZhciBpLCBwYXJ0O1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgYXJ5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0cGFydCA9IGFyeVtpXTtcblx0XHRcdFx0XHRpZiAocGFydCA9PT0gJy4nKSB7XG5cdFx0XHRcdFx0XHRhcnkuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0aSAtPSAxO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAocGFydCA9PT0gJy4uJykge1xuXHRcdFx0XHRcdFx0Ly8gSWYgYXQgdGhlIHN0YXJ0LCBvciBwcmV2aW91cyB2YWx1ZSBpcyBzdGlsbCAuLixcblx0XHRcdFx0XHRcdC8vIGtlZXAgdGhlbSBzbyB0aGF0IHdoZW4gY29udmVydGVkIHRvIGEgcGF0aCBpdCBtYXlcblx0XHRcdFx0XHRcdC8vIHN0aWxsIHdvcmsgd2hlbiBjb252ZXJ0ZWQgdG8gYSBwYXRoLCBldmVuIHRob3VnaFxuXHRcdFx0XHRcdFx0Ly8gYXMgYW4gSUQgaXQgaXMgbGVzcyB0aGFuIGlkZWFsLiBJbiBsYXJnZXIgcG9pbnRcblx0XHRcdFx0XHRcdC8vIHJlbGVhc2VzLCBtYXkgYmUgYmV0dGVyIHRvIGp1c3Qga2ljayBvdXQgYW4gZXJyb3IuXG5cdFx0XHRcdFx0XHRpZiAoaSA9PT0gMCB8fCAoaSA9PT0gMSAmJiBhcnlbMl0gPT09ICcuLicpIHx8IGFyeVtpIC0gMV0gPT09ICcuLicpIHtcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGkgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGFyeS5zcGxpY2UoaSAtIDEsIDIpO1xuXHRcdFx0XHRcdFx0XHRpIC09IDI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogR2l2ZW4gYSByZWxhdGl2ZSBtb2R1bGUgbmFtZSwgbGlrZSAuL3NvbWV0aGluZywgbm9ybWFsaXplIGl0IHRvXG5cdFx0XHQgKiBhIHJlYWwgbmFtZSB0aGF0IGNhbiBiZSBtYXBwZWQgdG8gYSBwYXRoLlxuXHRcdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgdGhlIHJlbGF0aXZlIG5hbWVcblx0XHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlTmFtZSBhIHJlYWwgbmFtZSB0aGF0IHRoZSBuYW1lIGFyZyBpcyByZWxhdGl2ZVxuXHRcdFx0ICogdG8uXG5cdFx0XHQgKiBAcGFyYW0ge0Jvb2xlYW59IGFwcGx5TWFwIGFwcGx5IHRoZSBtYXAgY29uZmlnIHRvIHRoZSB2YWx1ZS4gU2hvdWxkXG5cdFx0XHQgKiBvbmx5IGJlIGRvbmUgaWYgdGhpcyBub3JtYWxpemF0aW9uIGlzIGZvciBhIGRlcGVuZGVuY3kgSUQuXG5cdFx0XHQgKiBAcmV0dXJucyB7U3RyaW5nfSBub3JtYWxpemVkIG5hbWVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gbm9ybWFsaXplKG5hbWUsIGJhc2VOYW1lLCBhcHBseU1hcCkge1xuXHRcdFx0XHR2YXIgcGtnTWFpbiwgbWFwVmFsdWUsIG5hbWVQYXJ0cywgaSwgaiwgbmFtZVNlZ21lbnQsIGxhc3RJbmRleCxcblx0XHRcdFx0XHRmb3VuZE1hcCwgZm91bmRJLCBmb3VuZFN0YXJNYXAsIHN0YXJJLCBub3JtYWxpemVkQmFzZVBhcnRzLFxuXHRcdFx0XHRcdGJhc2VQYXJ0cyA9IChiYXNlTmFtZSAmJiBiYXNlTmFtZS5zcGxpdCgnLycpKSxcblx0XHRcdFx0XHRtYXAgPSBjb25maWcubWFwLFxuXHRcdFx0XHRcdHN0YXJNYXAgPSBtYXAgJiYgbWFwWycqJ107XG5cblx0XHRcdFx0Ly9BZGp1c3QgYW55IHJlbGF0aXZlIHBhdGhzLlxuXHRcdFx0XHRpZiAobmFtZSkge1xuXHRcdFx0XHRcdG5hbWUgPSBuYW1lLnNwbGl0KCcvJyk7XG5cdFx0XHRcdFx0bGFzdEluZGV4ID0gbmFtZS5sZW5ndGggLSAxO1xuXG5cdFx0XHRcdFx0Ly8gSWYgd2FudGluZyBub2RlIElEIGNvbXBhdGliaWxpdHksIHN0cmlwIC5qcyBmcm9tIGVuZFxuXHRcdFx0XHRcdC8vIG9mIElEcy4gSGF2ZSB0byBkbyB0aGlzIGhlcmUsIGFuZCBub3QgaW4gbmFtZVRvVXJsXG5cdFx0XHRcdFx0Ly8gYmVjYXVzZSBub2RlIGFsbG93cyBlaXRoZXIgLmpzIG9yIG5vbiAuanMgdG8gbWFwXG5cdFx0XHRcdFx0Ly8gdG8gc2FtZSBmaWxlLlxuXHRcdFx0XHRcdGlmIChjb25maWcubm9kZUlkQ29tcGF0ICYmIGpzU3VmZml4UmVnRXhwLnRlc3QobmFtZVtsYXN0SW5kZXhdKSkge1xuXHRcdFx0XHRcdFx0bmFtZVtsYXN0SW5kZXhdID0gbmFtZVtsYXN0SW5kZXhdLnJlcGxhY2UoanNTdWZmaXhSZWdFeHAsICcnKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBTdGFydHMgd2l0aCBhICcuJyBzbyBuZWVkIHRoZSBiYXNlTmFtZVxuXHRcdFx0XHRcdGlmIChuYW1lWzBdLmNoYXJBdCgwKSA9PT0gJy4nICYmIGJhc2VQYXJ0cykge1xuXHRcdFx0XHRcdFx0Ly9Db252ZXJ0IGJhc2VOYW1lIHRvIGFycmF5LCBhbmQgbG9wIG9mZiB0aGUgbGFzdCBwYXJ0LFxuXHRcdFx0XHRcdFx0Ly9zbyB0aGF0IC4gbWF0Y2hlcyB0aGF0ICdkaXJlY3RvcnknIGFuZCBub3QgbmFtZSBvZiB0aGUgYmFzZU5hbWUnc1xuXHRcdFx0XHRcdFx0Ly9tb2R1bGUuIEZvciBpbnN0YW5jZSwgYmFzZU5hbWUgb2YgJ29uZS90d28vdGhyZWUnLCBtYXBzIHRvXG5cdFx0XHRcdFx0XHQvLydvbmUvdHdvL3RocmVlLmpzJywgYnV0IHdlIHdhbnQgdGhlIGRpcmVjdG9yeSwgJ29uZS90d28nIGZvclxuXHRcdFx0XHRcdFx0Ly90aGlzIG5vcm1hbGl6YXRpb24uXG5cdFx0XHRcdFx0XHRub3JtYWxpemVkQmFzZVBhcnRzID0gYmFzZVBhcnRzLnNsaWNlKDAsIGJhc2VQYXJ0cy5sZW5ndGggLSAxKTtcblx0XHRcdFx0XHRcdG5hbWUgPSBub3JtYWxpemVkQmFzZVBhcnRzLmNvbmNhdChuYW1lKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR0cmltRG90cyhuYW1lKTtcblx0XHRcdFx0XHRuYW1lID0gbmFtZS5qb2luKCcvJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0FwcGx5IG1hcCBjb25maWcgaWYgYXZhaWxhYmxlLlxuXHRcdFx0XHRpZiAoYXBwbHlNYXAgJiYgbWFwICYmIChiYXNlUGFydHMgfHwgc3Rhck1hcCkpIHtcblx0XHRcdFx0XHRuYW1lUGFydHMgPSBuYW1lLnNwbGl0KCcvJyk7XG5cblx0XHRcdFx0XHRvdXRlckxvb3A6IGZvciAoaSA9IG5hbWVQYXJ0cy5sZW5ndGg7IGkgPiAwOyBpIC09IDEpIHtcblx0XHRcdFx0XHRcdG5hbWVTZWdtZW50ID0gbmFtZVBhcnRzLnNsaWNlKDAsIGkpLmpvaW4oJy8nKTtcblxuXHRcdFx0XHRcdFx0aWYgKGJhc2VQYXJ0cykge1xuXHRcdFx0XHRcdFx0XHQvL0ZpbmQgdGhlIGxvbmdlc3QgYmFzZU5hbWUgc2VnbWVudCBtYXRjaCBpbiB0aGUgY29uZmlnLlxuXHRcdFx0XHRcdFx0XHQvL1NvLCBkbyBqb2lucyBvbiB0aGUgYmlnZ2VzdCB0byBzbWFsbGVzdCBsZW5ndGhzIG9mIGJhc2VQYXJ0cy5cblx0XHRcdFx0XHRcdFx0Zm9yIChqID0gYmFzZVBhcnRzLmxlbmd0aDsgaiA+IDA7IGogLT0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdG1hcFZhbHVlID0gZ2V0T3duKG1hcCwgYmFzZVBhcnRzLnNsaWNlKDAsIGopLmpvaW4oJy8nKSk7XG5cblx0XHRcdFx0XHRcdFx0XHQvL2Jhc2VOYW1lIHNlZ21lbnQgaGFzIGNvbmZpZywgZmluZCBpZiBpdCBoYXMgb25lIGZvclxuXHRcdFx0XHRcdFx0XHRcdC8vdGhpcyBuYW1lLlxuXHRcdFx0XHRcdFx0XHRcdGlmIChtYXBWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWFwVmFsdWUgPSBnZXRPd24obWFwVmFsdWUsIG5hbWVTZWdtZW50KTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChtYXBWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL01hdGNoLCB1cGRhdGUgbmFtZSB0byB0aGUgbmV3IHZhbHVlLlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRmb3VuZE1hcCA9IG1hcFZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmb3VuZEkgPSBpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBvdXRlckxvb3A7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vQ2hlY2sgZm9yIGEgc3RhciBtYXAgbWF0Y2gsIGJ1dCBqdXN0IGhvbGQgb24gdG8gaXQsXG5cdFx0XHRcdFx0XHQvL2lmIHRoZXJlIGlzIGEgc2hvcnRlciBzZWdtZW50IG1hdGNoIGxhdGVyIGluIGEgbWF0Y2hpbmdcblx0XHRcdFx0XHRcdC8vY29uZmlnLCB0aGVuIGZhdm9yIG92ZXIgdGhpcyBzdGFyIG1hcC5cblx0XHRcdFx0XHRcdGlmICghZm91bmRTdGFyTWFwICYmIHN0YXJNYXAgJiYgZ2V0T3duKHN0YXJNYXAsIG5hbWVTZWdtZW50KSkge1xuXHRcdFx0XHRcdFx0XHRmb3VuZFN0YXJNYXAgPSBnZXRPd24oc3Rhck1hcCwgbmFtZVNlZ21lbnQpO1xuXHRcdFx0XHRcdFx0XHRzdGFySSA9IGk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFmb3VuZE1hcCAmJiBmb3VuZFN0YXJNYXApIHtcblx0XHRcdFx0XHRcdGZvdW5kTWFwID0gZm91bmRTdGFyTWFwO1xuXHRcdFx0XHRcdFx0Zm91bmRJID0gc3Rhckk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGZvdW5kTWFwKSB7XG5cdFx0XHRcdFx0XHRuYW1lUGFydHMuc3BsaWNlKDAsIGZvdW5kSSwgZm91bmRNYXApO1xuXHRcdFx0XHRcdFx0bmFtZSA9IG5hbWVQYXJ0cy5qb2luKCcvJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgdGhlIG5hbWUgcG9pbnRzIHRvIGEgcGFja2FnZSdzIG5hbWUsIHVzZVxuXHRcdFx0XHQvLyB0aGUgcGFja2FnZSBtYWluIGluc3RlYWQuXG5cdFx0XHRcdHBrZ01haW4gPSBnZXRPd24oY29uZmlnLnBrZ3MsIG5hbWUpO1xuXG5cdFx0XHRcdHJldHVybiBwa2dNYWluID8gcGtnTWFpbiA6IG5hbWU7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlbW92ZVNjcmlwdChuYW1lKSB7XG5cdFx0XHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdFx0XHRlYWNoKHNjcmlwdHMoKSwgZnVuY3Rpb24gKHNjcmlwdE5vZGUpIHtcblx0XHRcdFx0XHRcdGlmIChzY3JpcHROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlbW9kdWxlJykgPT09IG5hbWUgJiZcblx0XHRcdFx0XHRcdFx0XHRzY3JpcHROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlY29udGV4dCcpID09PSBjb250ZXh0LmNvbnRleHROYW1lKSB7XG5cdFx0XHRcdFx0XHRcdHNjcmlwdE5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHROb2RlKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaGFzUGF0aEZhbGxiYWNrKGlkKSB7XG5cdFx0XHRcdHZhciBwYXRoQ29uZmlnID0gZ2V0T3duKGNvbmZpZy5wYXRocywgaWQpO1xuXHRcdFx0XHRpZiAocGF0aENvbmZpZyAmJiBpc0FycmF5KHBhdGhDb25maWcpICYmIHBhdGhDb25maWcubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdHBhdGhDb25maWcuc2hpZnQoKTtcblx0XHRcdFx0XHRjb250ZXh0LnJlcXVpcmUudW5kZWYoaWQpO1xuXG5cdFx0XHRcdFx0Y29udGV4dC5tYWtlUmVxdWlyZShudWxsLCB7XG5cdFx0XHRcdFx0XHRza2lwTWFwOiB0cnVlXG5cdFx0XHRcdFx0fSkoW2lkXSk7XG5cblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBzcGxpdFByZWZpeChuYW1lKSB7XG5cdFx0XHRcdHZhciBwcmVmaXgsXG5cdFx0XHRcdFx0aW5kZXggPSBuYW1lID8gbmFtZS5pbmRleE9mKCchJykgOiAtMTtcblx0XHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0XHRwcmVmaXggPSBuYW1lLnN1YnN0cmluZygwLCBpbmRleCk7XG5cdFx0XHRcdFx0bmFtZSA9IG5hbWUuc3Vic3RyaW5nKGluZGV4ICsgMSwgbmFtZS5sZW5ndGgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBbcHJlZml4LCBuYW1lXTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDcmVhdGVzIGEgbW9kdWxlIG1hcHBpbmcgdGhhdCBpbmNsdWRlcyBwbHVnaW4gcHJlZml4LCBtb2R1bGVcblx0XHRcdCAqIG5hbWUsIGFuZCBwYXRoLiBJZiBwYXJlbnRNb2R1bGVNYXAgaXMgcHJvdmlkZWQgaXQgd2lsbFxuXHRcdFx0ICogYWxzbyBub3JtYWxpemUgdGhlIG5hbWUgdmlhIHJlcXVpcmUubm9ybWFsaXplKClcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSB0aGUgbW9kdWxlIG5hbWVcblx0XHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBbcGFyZW50TW9kdWxlTWFwXSBwYXJlbnQgbW9kdWxlIG1hcFxuXHRcdFx0ICogZm9yIHRoZSBtb2R1bGUgbmFtZSwgdXNlZCB0byByZXNvbHZlIHJlbGF0aXZlIG5hbWVzLlxuXHRcdFx0ICogQHBhcmFtIHtCb29sZWFufSBpc05vcm1hbGl6ZWQ6IGlzIHRoZSBJRCBhbHJlYWR5IG5vcm1hbGl6ZWQuXG5cdFx0XHQgKiBUaGlzIGlzIHRydWUgaWYgdGhpcyBjYWxsIGlzIGRvbmUgZm9yIGEgZGVmaW5lKCkgbW9kdWxlIElELlxuXHRcdFx0ICogQHBhcmFtIHtCb29sZWFufSBhcHBseU1hcDogYXBwbHkgdGhlIG1hcCBjb25maWcgdG8gdGhlIElELlxuXHRcdFx0ICogU2hvdWxkIG9ubHkgYmUgdHJ1ZSBpZiB0aGlzIG1hcCBpcyBmb3IgYSBkZXBlbmRlbmN5LlxuXHRcdFx0ICpcblx0XHRcdCAqIEByZXR1cm5zIHtPYmplY3R9XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIG1ha2VNb2R1bGVNYXAobmFtZSwgcGFyZW50TW9kdWxlTWFwLCBpc05vcm1hbGl6ZWQsIGFwcGx5TWFwKSB7XG5cdFx0XHRcdHZhciB1cmwsIHBsdWdpbk1vZHVsZSwgc3VmZml4LCBuYW1lUGFydHMsXG5cdFx0XHRcdFx0cHJlZml4ID0gbnVsbCxcblx0XHRcdFx0XHRwYXJlbnROYW1lID0gcGFyZW50TW9kdWxlTWFwID8gcGFyZW50TW9kdWxlTWFwLm5hbWUgOiBudWxsLFxuXHRcdFx0XHRcdG9yaWdpbmFsTmFtZSA9IG5hbWUsXG5cdFx0XHRcdFx0aXNEZWZpbmUgPSB0cnVlLFxuXHRcdFx0XHRcdG5vcm1hbGl6ZWROYW1lID0gJyc7XG5cblx0XHRcdFx0Ly9JZiBubyBuYW1lLCB0aGVuIGl0IG1lYW5zIGl0IGlzIGEgcmVxdWlyZSBjYWxsLCBnZW5lcmF0ZSBhblxuXHRcdFx0XHQvL2ludGVybmFsIG5hbWUuXG5cdFx0XHRcdGlmICghbmFtZSkge1xuXHRcdFx0XHRcdGlzRGVmaW5lID0gZmFsc2U7XG5cdFx0XHRcdFx0bmFtZSA9ICdfQHInICsgKHJlcXVpcmVDb3VudGVyICs9IDEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bmFtZVBhcnRzID0gc3BsaXRQcmVmaXgobmFtZSk7XG5cdFx0XHRcdHByZWZpeCA9IG5hbWVQYXJ0c1swXTtcblx0XHRcdFx0bmFtZSA9IG5hbWVQYXJ0c1sxXTtcblxuXHRcdFx0XHRpZiAocHJlZml4KSB7XG5cdFx0XHRcdFx0cHJlZml4ID0gbm9ybWFsaXplKHByZWZpeCwgcGFyZW50TmFtZSwgYXBwbHlNYXApO1xuXHRcdFx0XHRcdHBsdWdpbk1vZHVsZSA9IGdldE93bihkZWZpbmVkLCBwcmVmaXgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9BY2NvdW50IGZvciByZWxhdGl2ZSBwYXRocyBpZiB0aGVyZSBpcyBhIGJhc2UgbmFtZS5cblx0XHRcdFx0aWYgKG5hbWUpIHtcblx0XHRcdFx0XHRpZiAocHJlZml4KSB7XG5cdFx0XHRcdFx0XHRpZiAoaXNOb3JtYWxpemVkKSB7XG5cdFx0XHRcdFx0XHRcdG5vcm1hbGl6ZWROYW1lID0gbmFtZTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocGx1Z2luTW9kdWxlICYmIHBsdWdpbk1vZHVsZS5ub3JtYWxpemUpIHtcblx0XHRcdFx0XHRcdFx0Ly9QbHVnaW4gaXMgbG9hZGVkLCB1c2UgaXRzIG5vcm1hbGl6ZSBtZXRob2QuXG5cdFx0XHRcdFx0XHRcdG5vcm1hbGl6ZWROYW1lID0gcGx1Z2luTW9kdWxlLm5vcm1hbGl6ZShuYW1lLCBmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBub3JtYWxpemUobmFtZSwgcGFyZW50TmFtZSwgYXBwbHlNYXApO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIElmIG5lc3RlZCBwbHVnaW4gcmVmZXJlbmNlcywgdGhlbiBkbyBub3QgdHJ5IHRvXG5cdFx0XHRcdFx0XHRcdC8vIG5vcm1hbGl6ZSwgYXMgaXQgd2lsbCBub3Qgbm9ybWFsaXplIGNvcnJlY3RseS4gVGhpc1xuXHRcdFx0XHRcdFx0XHQvLyBwbGFjZXMgYSByZXN0cmljdGlvbiBvbiByZXNvdXJjZUlkcywgYW5kIHRoZSBsb25nZXJcblx0XHRcdFx0XHRcdFx0Ly8gdGVybSBzb2x1dGlvbiBpcyBub3QgdG8gbm9ybWFsaXplIHVudGlsIHBsdWdpbnMgYXJlXG5cdFx0XHRcdFx0XHRcdC8vIGxvYWRlZCBhbmQgYWxsIG5vcm1hbGl6YXRpb25zIHRvIGFsbG93IGZvciBhc3luY1xuXHRcdFx0XHRcdFx0XHQvLyBsb2FkaW5nIG9mIGEgbG9hZGVyIHBsdWdpbi4gQnV0IGZvciBub3csIGZpeGVzIHRoZVxuXHRcdFx0XHRcdFx0XHQvLyBjb21tb24gdXNlcy4gRGV0YWlscyBpbiAjMTEzMVxuXHRcdFx0XHRcdFx0XHRub3JtYWxpemVkTmFtZSA9IG5hbWUuaW5kZXhPZignIScpID09PSAtMSA/XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0IG5vcm1hbGl6ZShuYW1lLCBwYXJlbnROYW1lLCBhcHBseU1hcCkgOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCBuYW1lO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvL0EgcmVndWxhciBtb2R1bGUuXG5cdFx0XHRcdFx0XHRub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZShuYW1lLCBwYXJlbnROYW1lLCBhcHBseU1hcCk7XG5cblx0XHRcdFx0XHRcdC8vTm9ybWFsaXplZCBuYW1lIG1heSBiZSBhIHBsdWdpbiBJRCBkdWUgdG8gbWFwIGNvbmZpZ1xuXHRcdFx0XHRcdFx0Ly9hcHBsaWNhdGlvbiBpbiBub3JtYWxpemUuIFRoZSBtYXAgY29uZmlnIHZhbHVlcyBtdXN0XG5cdFx0XHRcdFx0XHQvL2FscmVhZHkgYmUgbm9ybWFsaXplZCwgc28gZG8gbm90IG5lZWQgdG8gcmVkbyB0aGF0IHBhcnQuXG5cdFx0XHRcdFx0XHRuYW1lUGFydHMgPSBzcGxpdFByZWZpeChub3JtYWxpemVkTmFtZSk7XG5cdFx0XHRcdFx0XHRwcmVmaXggPSBuYW1lUGFydHNbMF07XG5cdFx0XHRcdFx0XHRub3JtYWxpemVkTmFtZSA9IG5hbWVQYXJ0c1sxXTtcblx0XHRcdFx0XHRcdGlzTm9ybWFsaXplZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdHVybCA9IGNvbnRleHQubmFtZVRvVXJsKG5vcm1hbGl6ZWROYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0lmIHRoZSBpZCBpcyBhIHBsdWdpbiBpZCB0aGF0IGNhbm5vdCBiZSBkZXRlcm1pbmVkIGlmIGl0IG5lZWRzXG5cdFx0XHRcdC8vbm9ybWFsaXphdGlvbiwgc3RhbXAgaXQgd2l0aCBhIHVuaXF1ZSBJRCBzbyB0d28gbWF0Y2hpbmcgcmVsYXRpdmVcblx0XHRcdFx0Ly9pZHMgdGhhdCBtYXkgY29uZmxpY3QgY2FuIGJlIHNlcGFyYXRlLlxuXHRcdFx0XHRzdWZmaXggPSBwcmVmaXggJiYgIXBsdWdpbk1vZHVsZSAmJiAhaXNOb3JtYWxpemVkID9cblx0XHRcdFx0XHRcdCAnX3Vubm9ybWFsaXplZCcgKyAodW5ub3JtYWxpemVkQ291bnRlciArPSAxKSA6XG5cdFx0XHRcdFx0XHQgJyc7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRwcmVmaXg6IHByZWZpeCxcblx0XHRcdFx0XHRuYW1lOiBub3JtYWxpemVkTmFtZSxcblx0XHRcdFx0XHRwYXJlbnRNYXA6IHBhcmVudE1vZHVsZU1hcCxcblx0XHRcdFx0XHR1bm5vcm1hbGl6ZWQ6ICEhc3VmZml4LFxuXHRcdFx0XHRcdHVybDogdXJsLFxuXHRcdFx0XHRcdG9yaWdpbmFsTmFtZTogb3JpZ2luYWxOYW1lLFxuXHRcdFx0XHRcdGlzRGVmaW5lOiBpc0RlZmluZSxcblx0XHRcdFx0XHRpZDogKHByZWZpeCA/XG5cdFx0XHRcdFx0XHRcdHByZWZpeCArICchJyArIG5vcm1hbGl6ZWROYW1lIDpcblx0XHRcdFx0XHRcdFx0bm9ybWFsaXplZE5hbWUpICsgc3VmZml4XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZShkZXBNYXApIHtcblx0XHRcdFx0dmFyIGlkID0gZGVwTWFwLmlkLFxuXHRcdFx0XHRcdG1vZCA9IGdldE93bihyZWdpc3RyeSwgaWQpO1xuXG5cdFx0XHRcdGlmICghbW9kKSB7XG5cdFx0XHRcdFx0bW9kID0gcmVnaXN0cnlbaWRdID0gbmV3IGNvbnRleHQuTW9kdWxlKGRlcE1hcCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbW9kO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBvbihkZXBNYXAsIG5hbWUsIGZuKSB7XG5cdFx0XHRcdHZhciBpZCA9IGRlcE1hcC5pZCxcblx0XHRcdFx0XHRtb2QgPSBnZXRPd24ocmVnaXN0cnksIGlkKTtcblxuXHRcdFx0XHRpZiAoaGFzUHJvcChkZWZpbmVkLCBpZCkgJiZcblx0XHRcdFx0XHRcdCghbW9kIHx8IG1vZC5kZWZpbmVFbWl0Q29tcGxldGUpKSB7XG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09ICdkZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0Zm4oZGVmaW5lZFtpZF0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtb2QgPSBnZXRNb2R1bGUoZGVwTWFwKTtcblx0XHRcdFx0XHRpZiAobW9kLmVycm9yICYmIG5hbWUgPT09ICdlcnJvcicpIHtcblx0XHRcdFx0XHRcdGZuKG1vZC5lcnJvcik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG1vZC5vbihuYW1lLCBmbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIG9uRXJyb3IoZXJyLCBlcnJiYWNrKSB7XG5cdFx0XHRcdHZhciBpZHMgPSBlcnIucmVxdWlyZU1vZHVsZXMsXG5cdFx0XHRcdFx0bm90aWZpZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAoZXJyYmFjaykge1xuXHRcdFx0XHRcdGVycmJhY2soZXJyKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlYWNoKGlkcywgZnVuY3Rpb24gKGlkKSB7XG5cdFx0XHRcdFx0XHR2YXIgbW9kID0gZ2V0T3duKHJlZ2lzdHJ5LCBpZCk7XG5cdFx0XHRcdFx0XHRpZiAobW9kKSB7XG5cdFx0XHRcdFx0XHRcdC8vU2V0IGVycm9yIG9uIG1vZHVsZSwgc28gaXQgc2tpcHMgdGltZW91dCBjaGVja3MuXG5cdFx0XHRcdFx0XHRcdG1vZC5lcnJvciA9IGVycjtcblx0XHRcdFx0XHRcdFx0aWYgKG1vZC5ldmVudHMuZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRub3RpZmllZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0bW9kLmVtaXQoJ2Vycm9yJywgZXJyKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0aWYgKCFub3RpZmllZCkge1xuXHRcdFx0XHRcdFx0cmVxLm9uRXJyb3IoZXJyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJbnRlcm5hbCBtZXRob2QgdG8gdHJhbnNmZXIgZ2xvYmFsUXVldWUgaXRlbXMgdG8gdGhpcyBjb250ZXh0J3Ncblx0XHRcdCAqIGRlZlF1ZXVlLlxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiB0YWtlR2xvYmFsUXVldWUoKSB7XG5cdFx0XHRcdC8vUHVzaCBhbGwgdGhlIGdsb2JhbERlZlF1ZXVlIGl0ZW1zIGludG8gdGhlIGNvbnRleHQncyBkZWZRdWV1ZVxuXHRcdFx0XHRpZiAoZ2xvYmFsRGVmUXVldWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZWFjaChnbG9iYWxEZWZRdWV1ZSwgZnVuY3Rpb24ocXVldWVJdGVtKSB7XG5cdFx0XHRcdFx0XHR2YXIgaWQgPSBxdWV1ZUl0ZW1bMF07XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmRlZlF1ZXVlTWFwW2lkXSA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkZWZRdWV1ZS5wdXNoKHF1ZXVlSXRlbSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Z2xvYmFsRGVmUXVldWUgPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRoYW5kbGVycyA9IHtcblx0XHRcdFx0J3JlcXVpcmUnOiBmdW5jdGlvbiAobW9kKSB7XG5cdFx0XHRcdFx0aWYgKG1vZC5yZXF1aXJlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbW9kLnJlcXVpcmU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiAobW9kLnJlcXVpcmUgPSBjb250ZXh0Lm1ha2VSZXF1aXJlKG1vZC5tYXApKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdleHBvcnRzJzogZnVuY3Rpb24gKG1vZCkge1xuXHRcdFx0XHRcdG1vZC51c2luZ0V4cG9ydHMgPSB0cnVlO1xuXHRcdFx0XHRcdGlmIChtb2QubWFwLmlzRGVmaW5lKSB7XG5cdFx0XHRcdFx0XHRpZiAobW9kLmV4cG9ydHMpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIChkZWZpbmVkW21vZC5tYXAuaWRdID0gbW9kLmV4cG9ydHMpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIChtb2QuZXhwb3J0cyA9IGRlZmluZWRbbW9kLm1hcC5pZF0gPSB7fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnbW9kdWxlJzogZnVuY3Rpb24gKG1vZCkge1xuXHRcdFx0XHRcdGlmIChtb2QubW9kdWxlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbW9kLm1vZHVsZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIChtb2QubW9kdWxlID0ge1xuXHRcdFx0XHRcdFx0XHRpZDogbW9kLm1hcC5pZCxcblx0XHRcdFx0XHRcdFx0dXJpOiBtb2QubWFwLnVybCxcblx0XHRcdFx0XHRcdFx0Y29uZmlnOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGdldE93bihjb25maWcuY29uZmlnLCBtb2QubWFwLmlkKSB8fCB7fTtcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0ZXhwb3J0czogbW9kLmV4cG9ydHMgfHwgKG1vZC5leHBvcnRzID0ge30pXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGZ1bmN0aW9uIGNsZWFuUmVnaXN0cnkoaWQpIHtcblx0XHRcdFx0Ly9DbGVhbiB1cCBtYWNoaW5lcnkgdXNlZCBmb3Igd2FpdGluZyBtb2R1bGVzLlxuXHRcdFx0XHRkZWxldGUgcmVnaXN0cnlbaWRdO1xuXHRcdFx0XHRkZWxldGUgZW5hYmxlZFJlZ2lzdHJ5W2lkXTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gYnJlYWtDeWNsZShtb2QsIHRyYWNlZCwgcHJvY2Vzc2VkKSB7XG5cdFx0XHRcdHZhciBpZCA9IG1vZC5tYXAuaWQ7XG5cblx0XHRcdFx0aWYgKG1vZC5lcnJvcikge1xuXHRcdFx0XHRcdG1vZC5lbWl0KCdlcnJvcicsIG1vZC5lcnJvcik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dHJhY2VkW2lkXSA9IHRydWU7XG5cdFx0XHRcdFx0ZWFjaChtb2QuZGVwTWFwcywgZnVuY3Rpb24gKGRlcE1hcCwgaSkge1xuXHRcdFx0XHRcdFx0dmFyIGRlcElkID0gZGVwTWFwLmlkLFxuXHRcdFx0XHRcdFx0XHRkZXAgPSBnZXRPd24ocmVnaXN0cnksIGRlcElkKTtcblxuXHRcdFx0XHRcdFx0Ly9Pbmx5IGZvcmNlIHRoaW5ncyB0aGF0IGhhdmUgbm90IGNvbXBsZXRlZFxuXHRcdFx0XHRcdFx0Ly9iZWluZyBkZWZpbmVkLCBzbyBzdGlsbCBpbiB0aGUgcmVnaXN0cnksXG5cdFx0XHRcdFx0XHQvL2FuZCBvbmx5IGlmIGl0IGhhcyBub3QgYmVlbiBtYXRjaGVkIHVwXG5cdFx0XHRcdFx0XHQvL2luIHRoZSBtb2R1bGUgYWxyZWFkeS5cblx0XHRcdFx0XHRcdGlmIChkZXAgJiYgIW1vZC5kZXBNYXRjaGVkW2ldICYmICFwcm9jZXNzZWRbZGVwSWRdKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChnZXRPd24odHJhY2VkLCBkZXBJZCkpIHtcblx0XHRcdFx0XHRcdFx0XHRtb2QuZGVmaW5lRGVwKGksIGRlZmluZWRbZGVwSWRdKTtcblx0XHRcdFx0XHRcdFx0XHRtb2QuY2hlY2soKTsgLy9wYXNzIGZhbHNlP1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrQ3ljbGUoZGVwLCB0cmFjZWQsIHByb2Nlc3NlZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRwcm9jZXNzZWRbaWRdID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBjaGVja0xvYWRlZCgpIHtcblx0XHRcdFx0dmFyIGVyciwgdXNpbmdQYXRoRmFsbGJhY2ssXG5cdFx0XHRcdFx0d2FpdEludGVydmFsID0gY29uZmlnLndhaXRTZWNvbmRzICogMTAwMCxcblx0XHRcdFx0XHQvL0l0IGlzIHBvc3NpYmxlIHRvIGRpc2FibGUgdGhlIHdhaXQgaW50ZXJ2YWwgYnkgdXNpbmcgd2FpdFNlY29uZHMgb2YgMC5cblx0XHRcdFx0XHRleHBpcmVkID0gd2FpdEludGVydmFsICYmIChjb250ZXh0LnN0YXJ0VGltZSArIHdhaXRJbnRlcnZhbCkgPCBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcblx0XHRcdFx0XHRub0xvYWRzID0gW10sXG5cdFx0XHRcdFx0cmVxQ2FsbHMgPSBbXSxcblx0XHRcdFx0XHRzdGlsbExvYWRpbmcgPSBmYWxzZSxcblx0XHRcdFx0XHRuZWVkQ3ljbGVDaGVjayA9IHRydWU7XG5cblx0XHRcdFx0Ly9EbyBub3QgYm90aGVyIGlmIHRoaXMgY2FsbCB3YXMgYSByZXN1bHQgb2YgYSBjeWNsZSBicmVhay5cblx0XHRcdFx0aWYgKGluQ2hlY2tMb2FkZWQpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpbkNoZWNrTG9hZGVkID0gdHJ1ZTtcblxuXHRcdFx0XHQvL0ZpZ3VyZSBvdXQgdGhlIHN0YXRlIG9mIGFsbCB0aGUgbW9kdWxlcy5cblx0XHRcdFx0ZWFjaFByb3AoZW5hYmxlZFJlZ2lzdHJ5LCBmdW5jdGlvbiAobW9kKSB7XG5cdFx0XHRcdFx0dmFyIG1hcCA9IG1vZC5tYXAsXG5cdFx0XHRcdFx0XHRtb2RJZCA9IG1hcC5pZDtcblxuXHRcdFx0XHRcdC8vU2tpcCB0aGluZ3MgdGhhdCBhcmUgbm90IGVuYWJsZWQgb3IgaW4gZXJyb3Igc3RhdGUuXG5cdFx0XHRcdFx0aWYgKCFtb2QuZW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghbWFwLmlzRGVmaW5lKSB7XG5cdFx0XHRcdFx0XHRyZXFDYWxscy5wdXNoKG1vZCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFtb2QuZXJyb3IpIHtcblx0XHRcdFx0XHRcdC8vSWYgdGhlIG1vZHVsZSBzaG91bGQgYmUgZXhlY3V0ZWQsIGFuZCBpdCBoYXMgbm90XG5cdFx0XHRcdFx0XHQvL2JlZW4gaW5pdGVkIGFuZCB0aW1lIGlzIHVwLCByZW1lbWJlciBpdC5cblx0XHRcdFx0XHRcdGlmICghbW9kLmluaXRlZCAmJiBleHBpcmVkKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChoYXNQYXRoRmFsbGJhY2sobW9kSWQpKSB7XG5cdFx0XHRcdFx0XHRcdFx0dXNpbmdQYXRoRmFsbGJhY2sgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdHN0aWxsTG9hZGluZyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0bm9Mb2Fkcy5wdXNoKG1vZElkKTtcblx0XHRcdFx0XHRcdFx0XHRyZW1vdmVTY3JpcHQobW9kSWQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCFtb2QuaW5pdGVkICYmIG1vZC5mZXRjaGVkICYmIG1hcC5pc0RlZmluZSkge1xuXHRcdFx0XHRcdFx0XHRzdGlsbExvYWRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRpZiAoIW1hcC5wcmVmaXgpIHtcblx0XHRcdFx0XHRcdFx0XHQvL05vIHJlYXNvbiB0byBrZWVwIGxvb2tpbmcgZm9yIHVuZmluaXNoZWRcblx0XHRcdFx0XHRcdFx0XHQvL2xvYWRpbmcuIElmIHRoZSBvbmx5IHN0aWxsTG9hZGluZyBpcyBhXG5cdFx0XHRcdFx0XHRcdFx0Ly9wbHVnaW4gcmVzb3VyY2UgdGhvdWdoLCBrZWVwIGdvaW5nLFxuXHRcdFx0XHRcdFx0XHRcdC8vYmVjYXVzZSBpdCBtYXkgYmUgdGhhdCBhIHBsdWdpbiByZXNvdXJjZVxuXHRcdFx0XHRcdFx0XHRcdC8vaXMgd2FpdGluZyBvbiBhIG5vbi1wbHVnaW4gY3ljbGUuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIChuZWVkQ3ljbGVDaGVjayA9IGZhbHNlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGV4cGlyZWQgJiYgbm9Mb2Fkcy5sZW5ndGgpIHtcblx0XHRcdFx0XHQvL0lmIHdhaXQgdGltZSBleHBpcmVkLCB0aHJvdyBlcnJvciBvZiB1bmxvYWRlZCBtb2R1bGVzLlxuXHRcdFx0XHRcdGVyciA9IG1ha2VFcnJvcigndGltZW91dCcsICdMb2FkIHRpbWVvdXQgZm9yIG1vZHVsZXM6ICcgKyBub0xvYWRzLCBudWxsLCBub0xvYWRzKTtcblx0XHRcdFx0XHRlcnIuY29udGV4dE5hbWUgPSBjb250ZXh0LmNvbnRleHROYW1lO1xuXHRcdFx0XHRcdHJldHVybiBvbkVycm9yKGVycik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL05vdCBleHBpcmVkLCBjaGVjayBmb3IgYSBjeWNsZS5cblx0XHRcdFx0aWYgKG5lZWRDeWNsZUNoZWNrKSB7XG5cdFx0XHRcdFx0ZWFjaChyZXFDYWxscywgZnVuY3Rpb24gKG1vZCkge1xuXHRcdFx0XHRcdFx0YnJlYWtDeWNsZShtb2QsIHt9LCB7fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0lmIHN0aWxsIHdhaXRpbmcgb24gbG9hZHMsIGFuZCB0aGUgd2FpdGluZyBsb2FkIGlzIHNvbWV0aGluZ1xuXHRcdFx0XHQvL290aGVyIHRoYW4gYSBwbHVnaW4gcmVzb3VyY2UsIG9yIHRoZXJlIGFyZSBzdGlsbCBvdXRzdGFuZGluZ1xuXHRcdFx0XHQvL3NjcmlwdHMsIHRoZW4ganVzdCB0cnkgYmFjayBsYXRlci5cblx0XHRcdFx0aWYgKCghZXhwaXJlZCB8fCB1c2luZ1BhdGhGYWxsYmFjaykgJiYgc3RpbGxMb2FkaW5nKSB7XG5cdFx0XHRcdFx0Ly9Tb21ldGhpbmcgaXMgc3RpbGwgd2FpdGluZyB0byBsb2FkLiBXYWl0IGZvciBpdCwgYnV0IG9ubHlcblx0XHRcdFx0XHQvL2lmIGEgdGltZW91dCBpcyBub3QgYWxyZWFkeSBpbiBlZmZlY3QuXG5cdFx0XHRcdFx0aWYgKChpc0Jyb3dzZXIgfHwgaXNXZWJXb3JrZXIpICYmICFjaGVja0xvYWRlZFRpbWVvdXRJZCkge1xuXHRcdFx0XHRcdFx0Y2hlY2tMb2FkZWRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0Y2hlY2tMb2FkZWRUaW1lb3V0SWQgPSAwO1xuXHRcdFx0XHRcdFx0XHRjaGVja0xvYWRlZCgpO1xuXHRcdFx0XHRcdFx0fSwgNTApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGluQ2hlY2tMb2FkZWQgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0TW9kdWxlID0gZnVuY3Rpb24gKG1hcCkge1xuXHRcdFx0XHR0aGlzLmV2ZW50cyA9IGdldE93bih1bmRlZkV2ZW50cywgbWFwLmlkKSB8fCB7fTtcblx0XHRcdFx0dGhpcy5tYXAgPSBtYXA7XG5cdFx0XHRcdHRoaXMuc2hpbSA9IGdldE93bihjb25maWcuc2hpbSwgbWFwLmlkKTtcblx0XHRcdFx0dGhpcy5kZXBFeHBvcnRzID0gW107XG5cdFx0XHRcdHRoaXMuZGVwTWFwcyA9IFtdO1xuXHRcdFx0XHR0aGlzLmRlcE1hdGNoZWQgPSBbXTtcblx0XHRcdFx0dGhpcy5wbHVnaW5NYXBzID0ge307XG5cdFx0XHRcdHRoaXMuZGVwQ291bnQgPSAwO1xuXG5cdFx0XHRcdC8qIHRoaXMuZXhwb3J0cyB0aGlzLmZhY3Rvcnlcblx0XHRcdFx0ICAgdGhpcy5kZXBNYXBzID0gW10sXG5cdFx0XHRcdCAgIHRoaXMuZW5hYmxlZCwgdGhpcy5mZXRjaGVkXG5cdFx0XHRcdCovXG5cdFx0XHR9O1xuXG5cdFx0XHRNb2R1bGUucHJvdG90eXBlID0ge1xuXHRcdFx0XHRpbml0OiBmdW5jdGlvbiAoZGVwTWFwcywgZmFjdG9yeSwgZXJyYmFjaywgb3B0aW9ucykge1xuXHRcdFx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0XHRcdFx0Ly9EbyBub3QgZG8gbW9yZSBpbml0cyBpZiBhbHJlYWR5IGRvbmUuIENhbiBoYXBwZW4gaWYgdGhlcmVcblx0XHRcdFx0XHQvL2FyZSBtdWx0aXBsZSBkZWZpbmUgY2FsbHMgZm9yIHRoZSBzYW1lIG1vZHVsZS4gVGhhdCBpcyBub3Rcblx0XHRcdFx0XHQvL2Egbm9ybWFsLCBjb21tb24gY2FzZSwgYnV0IGl0IGlzIGFsc28gbm90IHVuZXhwZWN0ZWQuXG5cdFx0XHRcdFx0aWYgKHRoaXMuaW5pdGVkKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhpcy5mYWN0b3J5ID0gZmFjdG9yeTtcblxuXHRcdFx0XHRcdGlmIChlcnJiYWNrKSB7XG5cdFx0XHRcdFx0XHQvL1JlZ2lzdGVyIGZvciBlcnJvcnMgb24gdGhpcyBtb2R1bGUuXG5cdFx0XHRcdFx0XHR0aGlzLm9uKCdlcnJvcicsIGVycmJhY2spO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5ldmVudHMuZXJyb3IpIHtcblx0XHRcdFx0XHRcdC8vSWYgbm8gZXJyYmFjayBhbHJlYWR5LCBidXQgdGhlcmUgYXJlIGVycm9yIGxpc3RlbmVyc1xuXHRcdFx0XHRcdFx0Ly9vbiB0aGlzIG1vZHVsZSwgc2V0IHVwIGFuIGVycmJhY2sgdG8gcGFzcyB0byB0aGUgZGVwcy5cblx0XHRcdFx0XHRcdGVycmJhY2sgPSBiaW5kKHRoaXMsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL0RvIGEgY29weSBvZiB0aGUgZGVwZW5kZW5jeSBhcnJheSwgc28gdGhhdFxuXHRcdFx0XHRcdC8vc291cmNlIGlucHV0cyBhcmUgbm90IG1vZGlmaWVkLiBGb3IgZXhhbXBsZVxuXHRcdFx0XHRcdC8vXCJzaGltXCIgZGVwcyBhcmUgcGFzc2VkIGluIGhlcmUgZGlyZWN0bHksIGFuZFxuXHRcdFx0XHRcdC8vZG9pbmcgYSBkaXJlY3QgbW9kaWZpY2F0aW9uIG9mIHRoZSBkZXBNYXBzIGFycmF5XG5cdFx0XHRcdFx0Ly93b3VsZCBhZmZlY3QgdGhhdCBjb25maWcuXG5cdFx0XHRcdFx0dGhpcy5kZXBNYXBzID0gZGVwTWFwcyAmJiBkZXBNYXBzLnNsaWNlKDApO1xuXG5cdFx0XHRcdFx0dGhpcy5lcnJiYWNrID0gZXJyYmFjaztcblxuXHRcdFx0XHRcdC8vSW5kaWNhdGUgdGhpcyBtb2R1bGUgaGFzIGJlIGluaXRpYWxpemVkXG5cdFx0XHRcdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0dGhpcy5pZ25vcmUgPSBvcHRpb25zLmlnbm9yZTtcblxuXHRcdFx0XHRcdC8vQ291bGQgaGF2ZSBvcHRpb24gdG8gaW5pdCB0aGlzIG1vZHVsZSBpbiBlbmFibGVkIG1vZGUsXG5cdFx0XHRcdFx0Ly9vciBjb3VsZCBoYXZlIGJlZW4gcHJldmlvdXNseSBtYXJrZWQgYXMgZW5hYmxlZC4gSG93ZXZlcixcblx0XHRcdFx0XHQvL3RoZSBkZXBlbmRlbmNpZXMgYXJlIG5vdCBrbm93biB1bnRpbCBpbml0IGlzIGNhbGxlZC4gU29cblx0XHRcdFx0XHQvL2lmIGVuYWJsZWQgcHJldmlvdXNseSwgbm93IHRyaWdnZXIgZGVwZW5kZW5jaWVzIGFzIGVuYWJsZWQuXG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuZW5hYmxlZCB8fCB0aGlzLmVuYWJsZWQpIHtcblx0XHRcdFx0XHRcdC8vRW5hYmxlIHRoaXMgbW9kdWxlIGFuZCBkZXBlbmRlbmNpZXMuXG5cdFx0XHRcdFx0XHQvL1dpbGwgY2FsbCB0aGlzLmNoZWNrKClcblx0XHRcdFx0XHRcdHRoaXMuZW5hYmxlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuY2hlY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0ZGVmaW5lRGVwOiBmdW5jdGlvbiAoaSwgZGVwRXhwb3J0cykge1xuXHRcdFx0XHRcdC8vQmVjYXVzZSBvZiBjeWNsZXMsIGRlZmluZWQgY2FsbGJhY2sgZm9yIGEgZ2l2ZW5cblx0XHRcdFx0XHQvL2V4cG9ydCBjYW4gYmUgY2FsbGVkIG1vcmUgdGhhbiBvbmNlLlxuXHRcdFx0XHRcdGlmICghdGhpcy5kZXBNYXRjaGVkW2ldKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlcE1hdGNoZWRbaV0gPSB0cnVlO1xuXHRcdFx0XHRcdFx0dGhpcy5kZXBDb3VudCAtPSAxO1xuXHRcdFx0XHRcdFx0dGhpcy5kZXBFeHBvcnRzW2ldID0gZGVwRXhwb3J0cztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0ZmV0Y2g6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAodGhpcy5mZXRjaGVkKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuZmV0Y2hlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRjb250ZXh0LnN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cblx0XHRcdFx0XHR2YXIgbWFwID0gdGhpcy5tYXA7XG5cblx0XHRcdFx0XHQvL0lmIHRoZSBtYW5hZ2VyIGlzIGZvciBhIHBsdWdpbiBtYW5hZ2VkIHJlc291cmNlLFxuXHRcdFx0XHRcdC8vYXNrIHRoZSBwbHVnaW4gdG8gbG9hZCBpdCBub3cuXG5cdFx0XHRcdFx0aWYgKHRoaXMuc2hpbSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tYWtlUmVxdWlyZSh0aGlzLm1hcCwge1xuXHRcdFx0XHRcdFx0XHRlbmFibGVCdWlsZENhbGxiYWNrOiB0cnVlXG5cdFx0XHRcdFx0XHR9KSh0aGlzLnNoaW0uZGVwcyB8fCBbXSwgYmluZCh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBtYXAucHJlZml4ID8gdGhpcy5jYWxsUGx1Z2luKCkgOiB0aGlzLmxvYWQoKTtcblx0XHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly9SZWd1bGFyIGRlcGVuZGVuY3kuXG5cdFx0XHRcdFx0XHRyZXR1cm4gbWFwLnByZWZpeCA/IHRoaXMuY2FsbFBsdWdpbigpIDogdGhpcy5sb2FkKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGxvYWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR2YXIgdXJsID0gdGhpcy5tYXAudXJsO1xuXG5cdFx0XHRcdFx0Ly9SZWd1bGFyIGRlcGVuZGVuY3kuXG5cdFx0XHRcdFx0aWYgKCF1cmxGZXRjaGVkW3VybF0pIHtcblx0XHRcdFx0XHRcdHVybEZldGNoZWRbdXJsXSA9IHRydWU7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmxvYWQodGhpcy5tYXAuaWQsIHVybCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBDaGVja3MgaWYgdGhlIG1vZHVsZSBpcyByZWFkeSB0byBkZWZpbmUgaXRzZWxmLCBhbmQgaWYgc28sXG5cdFx0XHRcdCAqIGRlZmluZSBpdC5cblx0XHRcdFx0ICovXG5cdFx0XHRcdGNoZWNrOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLmVuYWJsZWQgfHwgdGhpcy5lbmFibGluZykge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciBlcnIsIGNqc01vZHVsZSxcblx0XHRcdFx0XHRcdGlkID0gdGhpcy5tYXAuaWQsXG5cdFx0XHRcdFx0XHRkZXBFeHBvcnRzID0gdGhpcy5kZXBFeHBvcnRzLFxuXHRcdFx0XHRcdFx0ZXhwb3J0cyA9IHRoaXMuZXhwb3J0cyxcblx0XHRcdFx0XHRcdGZhY3RvcnkgPSB0aGlzLmZhY3Rvcnk7XG5cblx0XHRcdFx0XHRpZiAoIXRoaXMuaW5pdGVkKSB7XG5cdFx0XHRcdFx0XHQvLyBPbmx5IGZldGNoIGlmIG5vdCBhbHJlYWR5IGluIHRoZSBkZWZRdWV1ZS5cblx0XHRcdFx0XHRcdGlmICghaGFzUHJvcChjb250ZXh0LmRlZlF1ZXVlTWFwLCBpZCkpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5mZXRjaCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5lcnJvcikge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KCdlcnJvcicsIHRoaXMuZXJyb3IpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIXRoaXMuZGVmaW5pbmcpIHtcblx0XHRcdFx0XHRcdHRoaXMuZGVmaW5pbmcgPSB0cnVlO1xuXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5kZXBDb3VudCA8IDEgJiYgIXRoaXMuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRpZiAoaXNGdW5jdGlvbihmYWN0b3J5KSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmICgodGhpcy5ldmVudHMuZXJyb3IgJiYgdGhpcy5tYXAuaXNEZWZpbmUpIHx8XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXEub25FcnJvciAhPT0gZGVmYXVsdE9uRXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRyeSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGV4cG9ydHMgPSBjb250ZXh0LmV4ZWNDYihpZCwgZmFjdG9yeSwgZGVwRXhwb3J0cywgZXhwb3J0cyk7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGVyciA9IGU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRcdGV4cG9ydHMgPSBjb250ZXh0LmV4ZWNDYihpZCwgZmFjdG9yeSwgZGVwRXhwb3J0cywgZXhwb3J0cyk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKHRoaXMubWFwLmlzRGVmaW5lICYmIGV4cG9ydHMgPT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2pzTW9kdWxlID0gdGhpcy5tb2R1bGU7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoY2pzTW9kdWxlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdGV4cG9ydHMgPSBjanNNb2R1bGUuZXhwb3J0cztcblx0XHRcdFx0XHRcdFx0XHRcdH0gZWxzZSBpZiAodGhpcy51c2luZ0V4cG9ydHMpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0Ly9leHBvcnRzIGFscmVhZHkgc2V0IHRoZSBkZWZpbmVkIHZhbHVlLlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRleHBvcnRzID0gdGhpcy5leHBvcnRzO1xuXHRcdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRcdGlmIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGVyci5yZXF1aXJlTWFwID0gdGhpcy5tYXA7XG5cdFx0XHRcdFx0XHRcdFx0XHRlcnIucmVxdWlyZU1vZHVsZXMgPSB0aGlzLm1hcC5pc0RlZmluZSA/IFt0aGlzLm1hcC5pZF0gOiBudWxsO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyLnJlcXVpcmVUeXBlID0gdGhpcy5tYXAuaXNEZWZpbmUgPyAnZGVmaW5lJyA6ICdyZXF1aXJlJztcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybiBvbkVycm9yKCh0aGlzLmVycm9yID0gZXJyKSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0ZXhwb3J0cyA9IGZhY3Rvcnk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR0aGlzLmV4cG9ydHMgPSBleHBvcnRzO1xuXG5cdFx0XHRcdFx0XHRcdGlmICh0aGlzLm1hcC5pc0RlZmluZSAmJiAhdGhpcy5pZ25vcmUpIHtcblx0XHRcdFx0XHRcdFx0XHRkZWZpbmVkW2lkXSA9IGV4cG9ydHM7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAocmVxLm9uUmVzb3VyY2VMb2FkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR2YXIgcmVzTG9hZE1hcHMgPSBbXTtcblx0XHRcdFx0XHRcdFx0XHRcdGVhY2godGhpcy5kZXBNYXBzLCBmdW5jdGlvbiAoZGVwTWFwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHJlc0xvYWRNYXBzLnB1c2goZGVwTWFwLm5vcm1hbGl6ZWRNYXAgfHwgZGVwTWFwKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRcdFx0cmVxLm9uUmVzb3VyY2VMb2FkKGNvbnRleHQsIHRoaXMubWFwLCByZXNMb2FkTWFwcyk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly9DbGVhbiB1cFxuXHRcdFx0XHRcdFx0XHRjbGVhblJlZ2lzdHJ5KGlkKTtcblxuXHRcdFx0XHRcdFx0XHR0aGlzLmRlZmluZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR0aGlzLmRlZmluaW5nID0gZmFsc2U7XG5cblx0XHRcdFx0XHRcdGlmICh0aGlzLmRlZmluZWQgJiYgIXRoaXMuZGVmaW5lRW1pdHRlZCkge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmRlZmluZUVtaXR0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR0aGlzLmVtaXQoJ2RlZmluZWQnLCB0aGlzLmV4cG9ydHMpO1xuXHRcdFx0XHRcdFx0XHR0aGlzLmRlZmluZUVtaXRDb21wbGV0ZSA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0Y2FsbFBsdWdpbjogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdHZhciBtYXAgPSB0aGlzLm1hcCxcblx0XHRcdFx0XHRcdGlkID0gbWFwLmlkLFxuXHRcdFx0XHRcdFx0cGx1Z2luTWFwID0gbWFrZU1vZHVsZU1hcChtYXAucHJlZml4KTtcblxuXHRcdFx0XHRcdHRoaXMuZGVwTWFwcy5wdXNoKHBsdWdpbk1hcCk7XG5cblx0XHRcdFx0XHRvbihwbHVnaW5NYXAsICdkZWZpbmVkJywgYmluZCh0aGlzLCBmdW5jdGlvbiAocGx1Z2luKSB7XG5cdFx0XHRcdFx0XHR2YXIgbG9hZCwgbm9ybWFsaXplZE1hcCwgbm9ybWFsaXplZE1vZCxcblx0XHRcdFx0XHRcdFx0YnVuZGxlSWQgPSBnZXRPd24oYnVuZGxlc01hcCwgdGhpcy5tYXAuaWQpLFxuXHRcdFx0XHRcdFx0XHRuYW1lID0gdGhpcy5tYXAubmFtZSxcblx0XHRcdFx0XHRcdFx0cGFyZW50TmFtZSA9IHRoaXMubWFwLnBhcmVudE1hcCA/IHRoaXMubWFwLnBhcmVudE1hcC5uYW1lIDogbnVsbCxcblx0XHRcdFx0XHRcdFx0bG9jYWxSZXF1aXJlID0gY29udGV4dC5tYWtlUmVxdWlyZShtYXAucGFyZW50TWFwLCB7XG5cdFx0XHRcdFx0XHRcdFx0ZW5hYmxlQnVpbGRDYWxsYmFjazogdHJ1ZVxuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0aWYgKHRoaXMubWFwLnVubm9ybWFsaXplZCkge1xuXHRcdFx0XHRcdFx0XHRpZiAocGx1Z2luLm5vcm1hbGl6ZSkge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWUgPSBwbHVnaW4ubm9ybWFsaXplKG5hbWUsIGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gbm9ybWFsaXplKG5hbWUsIHBhcmVudE5hbWUsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pIHx8ICcnO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0bm9ybWFsaXplZE1hcCA9IG1ha2VNb2R1bGVNYXAobWFwLnByZWZpeCArICchJyArIG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICB0aGlzLm1hcC5wYXJlbnRNYXAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICB0cnVlKTtcblx0XHRcdFx0XHRcdFx0b24obm9ybWFsaXplZE1hcCxcblx0XHRcdFx0XHRcdFx0XHQnZGVmaW5lZCcsIGJpbmQodGhpcywgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLm1hcC5ub3JtYWxpemVkTWFwID0gbm9ybWFsaXplZE1hcDtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuaW5pdChbXSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWU7IH0sIG51bGwsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZW5hYmxlZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWdub3JlOiB0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9KSk7XG5cblx0XHRcdFx0XHRcdFx0bm9ybWFsaXplZE1vZCA9IGdldE93bihyZWdpc3RyeSwgbm9ybWFsaXplZE1hcC5pZCk7XG5cdFx0XHRcdFx0XHRcdGlmIChub3JtYWxpemVkTW9kKSB7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5kZXBNYXBzLnB1c2gobm9ybWFsaXplZE1hcCk7XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAodGhpcy5ldmVudHMuZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRcdG5vcm1hbGl6ZWRNb2Qub24oJ2Vycm9yJywgYmluZCh0aGlzLCBmdW5jdGlvbiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSkpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRub3JtYWxpemVkTW9kLmVuYWJsZSgpO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZiAoYnVuZGxlSWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5tYXAudXJsID0gY29udGV4dC5uYW1lVG9VcmwoYnVuZGxlSWQpO1xuXHRcdFx0XHRcdFx0XHR0aGlzLmxvYWQoKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRsb2FkID0gYmluZCh0aGlzLCBmdW5jdGlvbiAodmFsdWUpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5pbml0KFtdLCBmdW5jdGlvbiAoKSB7IHJldHVybiB2YWx1ZTsgfSwgbnVsbCwge1xuXHRcdFx0XHRcdFx0XHRcdGVuYWJsZWQ6IHRydWVcblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0bG9hZC5lcnJvciA9IGJpbmQodGhpcywgZnVuY3Rpb24gKGVycikge1xuXHRcdFx0XHRcdFx0XHR0aGlzLmluaXRlZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdHRoaXMuZXJyb3IgPSBlcnI7XG5cdFx0XHRcdFx0XHRcdGVyci5yZXF1aXJlTW9kdWxlcyA9IFtpZF07XG5cblx0XHRcdFx0XHRcdFx0ZWFjaFByb3AocmVnaXN0cnksIGZ1bmN0aW9uIChtb2QpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAobW9kLm1hcC5pZC5pbmRleE9mKGlkICsgJ191bm5vcm1hbGl6ZWQnKSA9PT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0Y2xlYW5SZWdpc3RyeShtb2QubWFwLmlkKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdG9uRXJyb3IoZXJyKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRwbHVnaW4ubG9hZChtYXAubmFtZSwgbG9jYWxSZXF1aXJlLCBsb2FkLCBjb25maWcpO1xuXHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0XHRjb250ZXh0LmVuYWJsZShwbHVnaW5NYXAsIHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luTWFwc1twbHVnaW5NYXAuaWRdID0gcGx1Z2luTWFwO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGVuYWJsZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGVuYWJsZWRSZWdpc3RyeVt0aGlzLm1hcC5pZF0gPSB0aGlzO1xuXHRcdFx0XHRcdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cdFx0XHRcdFx0dGhpcy5lbmFibGluZyA9IHRydWU7XG5cblx0XHRcdFx0XHRlYWNoKHRoaXMuZGVwTWFwcywgYmluZCh0aGlzLCBmdW5jdGlvbiAoZGVwTWFwLCBpKSB7XG5cdFx0XHRcdFx0XHR2YXIgaWQsIG1vZCwgaGFuZGxlcjtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBkZXBNYXAgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0XHRcdGRlcE1hcCA9IG1ha2VNb2R1bGVNYXAoZGVwTWFwLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICAgKHRoaXMubWFwLmlzRGVmaW5lID8gdGhpcy5tYXAgOiB0aGlzLm1hcC5wYXJlbnRNYXApLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICAgZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgICAhdGhpcy5za2lwTWFwKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5kZXBNYXBzW2ldID0gZGVwTWFwO1xuXG5cdFx0XHRcdFx0XHRcdGhhbmRsZXIgPSBnZXRPd24oaGFuZGxlcnMsIGRlcE1hcC5pZCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGhhbmRsZXIpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmRlcEV4cG9ydHNbaV0gPSBoYW5kbGVyKHRoaXMpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHRoaXMuZGVwQ291bnQgKz0gMTtcblxuXHRcdFx0XHRcdFx0XHRvbihkZXBNYXAsICdkZWZpbmVkJywgYmluZCh0aGlzLCBmdW5jdGlvbiAoZGVwRXhwb3J0cykge1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLnVuZGVmZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5kZWZpbmVEZXAoaSwgZGVwRXhwb3J0cyk7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5jaGVjaygpO1xuXHRcdFx0XHRcdFx0XHR9KSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuZXJyYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdG9uKGRlcE1hcCwgJ2Vycm9yJywgYmluZCh0aGlzLCB0aGlzLmVycmJhY2spKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLmV2ZW50cy5lcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdG9uKGRlcE1hcCwgJ2Vycm9yJywgYmluZCh0aGlzLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuXHRcdFx0XHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZCA9IGRlcE1hcC5pZDtcblx0XHRcdFx0XHRcdG1vZCA9IHJlZ2lzdHJ5W2lkXTtcblxuXHRcdFx0XHRcdFx0aWYgKCFoYXNQcm9wKGhhbmRsZXJzLCBpZCkgJiYgbW9kICYmICFtb2QuZW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmVuYWJsZShkZXBNYXAsIHRoaXMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblxuXHRcdFx0XHRcdGVhY2hQcm9wKHRoaXMucGx1Z2luTWFwcywgYmluZCh0aGlzLCBmdW5jdGlvbiAocGx1Z2luTWFwKSB7XG5cdFx0XHRcdFx0XHR2YXIgbW9kID0gZ2V0T3duKHJlZ2lzdHJ5LCBwbHVnaW5NYXAuaWQpO1xuXHRcdFx0XHRcdFx0aWYgKG1vZCAmJiAhbW9kLmVuYWJsZWQpIHtcblx0XHRcdFx0XHRcdFx0Y29udGV4dC5lbmFibGUocGx1Z2luTWFwLCB0aGlzKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KSk7XG5cblx0XHRcdFx0XHR0aGlzLmVuYWJsaW5nID0gZmFsc2U7XG5cblx0XHRcdFx0XHR0aGlzLmNoZWNrKCk7XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0b246IGZ1bmN0aW9uIChuYW1lLCBjYikge1xuXHRcdFx0XHRcdHZhciBjYnMgPSB0aGlzLmV2ZW50c1tuYW1lXTtcblx0XHRcdFx0XHRpZiAoIWNicykge1xuXHRcdFx0XHRcdFx0Y2JzID0gdGhpcy5ldmVudHNbbmFtZV0gPSBbXTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y2JzLnB1c2goY2IpO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGVtaXQ6IGZ1bmN0aW9uIChuYW1lLCBldnQpIHtcblx0XHRcdFx0XHRlYWNoKHRoaXMuZXZlbnRzW25hbWVdLCBmdW5jdGlvbiAoY2IpIHtcblx0XHRcdFx0XHRcdGNiKGV2dCk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09ICdlcnJvcicpIHtcblx0XHRcdFx0XHRcdC8vTm93IHRoYXQgdGhlIGVycm9yIGhhbmRsZXIgd2FzIHRyaWdnZXJlZCwgcmVtb3ZlXG5cdFx0XHRcdFx0XHQvL3RoZSBsaXN0ZW5lcnMsIHNpbmNlIHRoaXMgYnJva2VuIE1vZHVsZSBpbnN0YW5jZVxuXHRcdFx0XHRcdFx0Ly9jYW4gc3RheSBhcm91bmQgZm9yIGEgd2hpbGUgaW4gdGhlIHJlZ2lzdHJ5LlxuXHRcdFx0XHRcdFx0ZGVsZXRlIHRoaXMuZXZlbnRzW25hbWVdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0ZnVuY3Rpb24gY2FsbEdldE1vZHVsZShhcmdzKSB7XG5cdFx0XHRcdC8vU2tpcCBtb2R1bGVzIGFscmVhZHkgZGVmaW5lZC5cblx0XHRcdFx0aWYgKCFoYXNQcm9wKGRlZmluZWQsIGFyZ3NbMF0pKSB7XG5cdFx0XHRcdFx0Z2V0TW9kdWxlKG1ha2VNb2R1bGVNYXAoYXJnc1swXSwgbnVsbCwgdHJ1ZSkpLmluaXQoYXJnc1sxXSwgYXJnc1syXSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gcmVtb3ZlTGlzdGVuZXIobm9kZSwgZnVuYywgbmFtZSwgaWVOYW1lKSB7XG5cdFx0XHRcdC8vRmF2b3IgZGV0YWNoRXZlbnQgYmVjYXVzZSBvZiBJRTlcblx0XHRcdFx0Ly9pc3N1ZSwgc2VlIGF0dGFjaEV2ZW50L2FkZEV2ZW50TGlzdGVuZXIgY29tbWVudCBlbHNld2hlcmVcblx0XHRcdFx0Ly9pbiB0aGlzIGZpbGUuXG5cdFx0XHRcdGlmIChub2RlLmRldGFjaEV2ZW50ICYmICFpc09wZXJhKSB7XG5cdFx0XHRcdFx0Ly9Qcm9iYWJseSBJRS4gSWYgbm90IGl0IHdpbGwgdGhyb3cgYW4gZXJyb3IsIHdoaWNoIHdpbGwgYmVcblx0XHRcdFx0XHQvL3VzZWZ1bCB0byBrbm93LlxuXHRcdFx0XHRcdGlmIChpZU5hbWUpIHtcblx0XHRcdFx0XHRcdG5vZGUuZGV0YWNoRXZlbnQoaWVOYW1lLCBmdW5jKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bm9kZS5yZW1vdmVFdmVudExpc3RlbmVyKG5hbWUsIGZ1bmMsIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvKipcblx0XHRcdCAqIEdpdmVuIGFuIGV2ZW50IGZyb20gYSBzY3JpcHQgbm9kZSwgZ2V0IHRoZSByZXF1aXJlanMgaW5mbyBmcm9tIGl0LFxuXHRcdFx0ICogYW5kIHRoZW4gcmVtb3ZlcyB0aGUgZXZlbnQgbGlzdGVuZXJzIG9uIHRoZSBub2RlLlxuXHRcdFx0ICogQHBhcmFtIHtFdmVudH0gZXZ0XG5cdFx0XHQgKiBAcmV0dXJucyB7T2JqZWN0fVxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiBnZXRTY3JpcHREYXRhKGV2dCkge1xuXHRcdFx0XHQvL1VzaW5nIGN1cnJlbnRUYXJnZXQgaW5zdGVhZCBvZiB0YXJnZXQgZm9yIEZpcmVmb3ggMi4wJ3Mgc2FrZS4gTm90XG5cdFx0XHRcdC8vYWxsIG9sZCBicm93c2VycyB3aWxsIGJlIHN1cHBvcnRlZCwgYnV0IHRoaXMgb25lIHdhcyBlYXN5IGVub3VnaFxuXHRcdFx0XHQvL3RvIHN1cHBvcnQgYW5kIHN0aWxsIG1ha2VzIHNlbnNlLlxuXHRcdFx0XHR2YXIgbm9kZSA9IGV2dC5jdXJyZW50VGFyZ2V0IHx8IGV2dC5zcmNFbGVtZW50O1xuXG5cdFx0XHRcdC8vUmVtb3ZlIHRoZSBsaXN0ZW5lcnMgb25jZSBoZXJlLlxuXHRcdFx0XHRyZW1vdmVMaXN0ZW5lcihub2RlLCBjb250ZXh0Lm9uU2NyaXB0TG9hZCwgJ2xvYWQnLCAnb25yZWFkeXN0YXRlY2hhbmdlJyk7XG5cdFx0XHRcdHJlbW92ZUxpc3RlbmVyKG5vZGUsIGNvbnRleHQub25TY3JpcHRFcnJvciwgJ2Vycm9yJyk7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRub2RlOiBub2RlLFxuXHRcdFx0XHRcdGlkOiBub2RlICYmIG5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXJlcXVpcmVtb2R1bGUnKVxuXHRcdFx0XHR9O1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBpbnRha2VEZWZpbmVzKCkge1xuXHRcdFx0XHR2YXIgYXJncztcblxuXHRcdFx0XHR0YWtlR2xvYmFsUXVldWUoKTtcblxuXHRcdFx0XHR3aGlsZSAoZGVmUXVldWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0YXJncyA9IGRlZlF1ZXVlLnNoaWZ0KCk7XG5cdFx0XHRcdFx0aWYgKGFyZ3NbMF0gPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdHJldHVybiBvbkVycm9yKG1ha2VFcnJvcignbWlzbWF0Y2gnLCAnTWlzbWF0Y2hlZCBhbm9ueW1vdXMgZGVmaW5lKCkgbW9kdWxlOiAnICtcblx0XHRcdFx0XHRcdFx0YXJnc1thcmdzLmxlbmd0aCAtIDFdKSk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdGNhbGxHZXRNb2R1bGUoYXJncyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHRcdGNvbnRleHQuZGVmUXVldWVNYXAgPSB7fTtcblx0XHRcdH1cblxuXHRcdFx0Y29udGV4dCA9IHtcblx0XHRcdFx0Y29uZmlnOiBjb25maWcsXG5cdFx0XHRcdGNvbnRleHROYW1lOiBjb250ZXh0TmFtZSxcblx0XHRcdFx0cmVnaXN0cnk6IHJlZ2lzdHJ5LFxuXHRcdFx0XHRkZWZpbmVkOiBkZWZpbmVkLFxuXHRcdFx0XHR1cmxGZXRjaGVkOiB1cmxGZXRjaGVkLFxuXHRcdFx0XHRkZWZRdWV1ZTogZGVmUXVldWUsXG5cdFx0XHRcdGRlZlF1ZXVlTWFwOiB7fSxcblx0XHRcdFx0TW9kdWxlOiBNb2R1bGUsXG5cdFx0XHRcdG1ha2VNb2R1bGVNYXA6IG1ha2VNb2R1bGVNYXAsXG5cdFx0XHRcdG5leHRUaWNrOiByZXEubmV4dFRpY2ssXG5cdFx0XHRcdG9uRXJyb3I6IG9uRXJyb3IsXG5cblx0XHRcdFx0Y29uZmlndXJlOiBmdW5jdGlvbiAoY2ZnKSB7XG5cdFx0XHRcdFx0aWYgKGNmZy5iYXNlVXJsKSB7XG5cdFx0XHRcdFx0XHRpZiAoY2ZnLmJhc2VVcmwuY2hhckF0KGNmZy5iYXNlVXJsLmxlbmd0aCAtIDEpICE9PSAnLycpIHtcblx0XHRcdFx0XHRcdFx0Y2ZnLmJhc2VVcmwgKz0gJy8nO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICh0eXBlb2YgY2ZnLnVybEFyZ3MgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0XHR2YXIgdXJsQXJncyA9IGNmZy51cmxBcmdzO1xuXHRcdFx0XHRcdFx0Y2ZnLnVybEFyZ3MgPSBmdW5jdGlvbihpZCwgdXJsKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiAodXJsLmluZGV4T2YoJz8nKSA9PT0gLTEgPyAnPycgOiAnJicpICsgdXJsQXJncztcblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dmFyIHNoaW0gPSBjb25maWcuc2hpbSxcblx0XHRcdFx0XHRcdG9ianMgPSB7XG5cdFx0XHRcdFx0XHRcdHBhdGhzOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRidW5kbGVzOiB0cnVlLFxuXHRcdFx0XHRcdFx0XHRjb25maWc6IHRydWUsXG5cdFx0XHRcdFx0XHRcdG1hcDogdHJ1ZVxuXHRcdFx0XHRcdFx0fTtcblxuXHRcdFx0XHRcdGVhY2hQcm9wKGNmZywgZnVuY3Rpb24gKHZhbHVlLCBwcm9wKSB7XG5cdFx0XHRcdFx0XHRpZiAob2Jqc1twcm9wXSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoIWNvbmZpZ1twcm9wXSkge1xuXHRcdFx0XHRcdFx0XHRcdGNvbmZpZ1twcm9wXSA9IHt9O1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdG1peGluKGNvbmZpZ1twcm9wXSwgdmFsdWUsIHRydWUsIHRydWUpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y29uZmlnW3Byb3BdID0gdmFsdWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRpZiAoY2ZnLmJ1bmRsZXMpIHtcblx0XHRcdFx0XHRcdGVhY2hQcm9wKGNmZy5idW5kbGVzLCBmdW5jdGlvbiAodmFsdWUsIHByb3ApIHtcblx0XHRcdFx0XHRcdFx0ZWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHYpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodiAhPT0gcHJvcCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YnVuZGxlc01hcFt2XSA9IHByb3A7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChjZmcuc2hpbSkge1xuXHRcdFx0XHRcdFx0ZWFjaFByb3AoY2ZnLnNoaW0sIGZ1bmN0aW9uICh2YWx1ZSwgaWQpIHtcblx0XHRcdFx0XHRcdFx0Ly9Ob3JtYWxpemUgdGhlIHN0cnVjdHVyZVxuXHRcdFx0XHRcdFx0XHRpZiAoaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdGRlcHM6IHZhbHVlXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoKHZhbHVlLmV4cG9ydHMgfHwgdmFsdWUuaW5pdCkgJiYgIXZhbHVlLmV4cG9ydHNGbikge1xuXHRcdFx0XHRcdFx0XHRcdHZhbHVlLmV4cG9ydHNGbiA9IGNvbnRleHQubWFrZVNoaW1FeHBvcnRzKHZhbHVlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRzaGltW2lkXSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRjb25maWcuc2hpbSA9IHNoaW07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGNmZy5wYWNrYWdlcykge1xuXHRcdFx0XHRcdFx0ZWFjaChjZmcucGFja2FnZXMsIGZ1bmN0aW9uIChwa2dPYmopIHtcblx0XHRcdFx0XHRcdFx0dmFyIGxvY2F0aW9uLCBuYW1lO1xuXG5cdFx0XHRcdFx0XHRcdHBrZ09iaiA9IHR5cGVvZiBwa2dPYmogPT09ICdzdHJpbmcnID8ge25hbWU6IHBrZ09ian0gOiBwa2dPYmo7XG5cblx0XHRcdFx0XHRcdFx0bmFtZSA9IHBrZ09iai5uYW1lO1xuXHRcdFx0XHRcdFx0XHRsb2NhdGlvbiA9IHBrZ09iai5sb2NhdGlvbjtcblx0XHRcdFx0XHRcdFx0aWYgKGxvY2F0aW9uKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uZmlnLnBhdGhzW25hbWVdID0gcGtnT2JqLmxvY2F0aW9uO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Y29uZmlnLnBrZ3NbbmFtZV0gPSBwa2dPYmoubmFtZSArICcvJyArIChwa2dPYmoubWFpbiB8fCAnbWFpbicpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAucmVwbGFjZShjdXJyRGlyUmVnRXhwLCAnJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0IC5yZXBsYWNlKGpzU3VmZml4UmVnRXhwLCAnJyk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRlYWNoUHJvcChyZWdpc3RyeSwgZnVuY3Rpb24gKG1vZCwgaWQpIHtcblx0XHRcdFx0XHRcdGlmICghbW9kLmluaXRlZCAmJiAhbW9kLm1hcC51bm5vcm1hbGl6ZWQpIHtcblx0XHRcdFx0XHRcdFx0bW9kLm1hcCA9IG1ha2VNb2R1bGVNYXAoaWQsIG51bGwsIHRydWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0aWYgKGNmZy5kZXBzIHx8IGNmZy5jYWxsYmFjaykge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5yZXF1aXJlKGNmZy5kZXBzIHx8IFtdLCBjZmcuY2FsbGJhY2spO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblxuXHRcdFx0XHRtYWtlU2hpbUV4cG9ydHM6IGZ1bmN0aW9uICh2YWx1ZSkge1xuXHRcdFx0XHRcdGZ1bmN0aW9uIGZuKCkge1xuXHRcdFx0XHRcdFx0dmFyIHJldDtcblx0XHRcdFx0XHRcdGlmICh2YWx1ZS5pbml0KSB7XG5cdFx0XHRcdFx0XHRcdHJldCA9IHZhbHVlLmluaXQuYXBwbHkoZ2xvYmFsLCBhcmd1bWVudHMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0cmV0dXJuIHJldCB8fCAodmFsdWUuZXhwb3J0cyAmJiBnZXRHbG9iYWwodmFsdWUuZXhwb3J0cykpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRyZXR1cm4gZm47XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0bWFrZVJlcXVpcmU6IGZ1bmN0aW9uIChyZWxNYXAsIG9wdGlvbnMpIHtcblx0XHRcdFx0XHRvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuXHRcdFx0XHRcdGZ1bmN0aW9uIGxvY2FsUmVxdWlyZShkZXBzLCBjYWxsYmFjaywgZXJyYmFjaykge1xuXHRcdFx0XHRcdFx0dmFyIGlkLCBtYXAsIHJlcXVpcmVNb2Q7XG5cblx0XHRcdFx0XHRcdGlmIChvcHRpb25zLmVuYWJsZUJ1aWxkQ2FsbGJhY2sgJiYgY2FsbGJhY2sgJiYgaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcblx0XHRcdFx0XHRcdFx0Y2FsbGJhY2suX19yZXF1aXJlSnNCdWlsZCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdGlmICh0eXBlb2YgZGVwcyA9PT0gJ3N0cmluZycpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGlzRnVuY3Rpb24oY2FsbGJhY2spKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIG9uRXJyb3IobWFrZUVycm9yKCdyZXF1aXJlYXJncycsICdJbnZhbGlkIHJlcXVpcmUgY2FsbCcpLCBlcnJiYWNrKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChyZWxNYXAgJiYgaGFzUHJvcChoYW5kbGVycywgZGVwcykpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaGFuZGxlcnNbZGVwc10ocmVnaXN0cnlbcmVsTWFwLmlkXSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRpZiAocmVxLmdldCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXEuZ2V0KGNvbnRleHQsIGRlcHMsIHJlbE1hcCwgbG9jYWxSZXF1aXJlKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdG1hcCA9IG1ha2VNb2R1bGVNYXAoZGVwcywgcmVsTWFwLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdGlkID0gbWFwLmlkO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghaGFzUHJvcChkZWZpbmVkLCBpZCkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb25FcnJvcihtYWtlRXJyb3IoJ25vdGxvYWRlZCcsICdNb2R1bGUgbmFtZSBcIicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnXCIgaGFzIG5vdCBiZWVuIGxvYWRlZCB5ZXQgZm9yIGNvbnRleHQ6ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHROYW1lICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQocmVsTWFwID8gJycgOiAnLiBVc2UgcmVxdWlyZShbXSknKSkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiBkZWZpbmVkW2lkXTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aW50YWtlRGVmaW5lcygpO1xuXG5cdFx0XHRcdFx0XHRjb250ZXh0Lm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0aW50YWtlRGVmaW5lcygpO1xuXG5cdFx0XHRcdFx0XHRcdHJlcXVpcmVNb2QgPSBnZXRNb2R1bGUobWFrZU1vZHVsZU1hcChudWxsLCByZWxNYXApKTtcblxuXHRcdFx0XHRcdFx0XHRyZXF1aXJlTW9kLnNraXBNYXAgPSBvcHRpb25zLnNraXBNYXA7XG5cblx0XHRcdFx0XHRcdFx0cmVxdWlyZU1vZC5pbml0KGRlcHMsIGNhbGxiYWNrLCBlcnJiYWNrLCB7XG5cdFx0XHRcdFx0XHRcdFx0ZW5hYmxlZDogdHJ1ZVxuXHRcdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0XHRjaGVja0xvYWRlZCgpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdHJldHVybiBsb2NhbFJlcXVpcmU7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bWl4aW4obG9jYWxSZXF1aXJlLCB7XG5cdFx0XHRcdFx0XHRpc0Jyb3dzZXI6IGlzQnJvd3NlcixcblxuXHRcdFx0XHRcdFx0dG9Vcmw6IGZ1bmN0aW9uIChtb2R1bGVOYW1lUGx1c0V4dCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgZXh0LFxuXHRcdFx0XHRcdFx0XHRcdGluZGV4ID0gbW9kdWxlTmFtZVBsdXNFeHQubGFzdEluZGV4T2YoJy4nKSxcblx0XHRcdFx0XHRcdFx0XHRzZWdtZW50ID0gbW9kdWxlTmFtZVBsdXNFeHQuc3BsaXQoJy8nKVswXSxcblx0XHRcdFx0XHRcdFx0XHRpc1JlbGF0aXZlID0gc2VnbWVudCA9PT0gJy4nIHx8IHNlZ21lbnQgPT09ICcuLic7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGluZGV4ICE9PSAtMSAmJiAoIWlzUmVsYXRpdmUgfHwgaW5kZXggPiAxKSkge1xuXHRcdFx0XHRcdFx0XHRcdGV4dCA9IG1vZHVsZU5hbWVQbHVzRXh0LnN1YnN0cmluZyhpbmRleCwgbW9kdWxlTmFtZVBsdXNFeHQubGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRtb2R1bGVOYW1lUGx1c0V4dCA9IG1vZHVsZU5hbWVQbHVzRXh0LnN1YnN0cmluZygwLCBpbmRleCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gY29udGV4dC5uYW1lVG9Vcmwobm9ybWFsaXplKG1vZHVsZU5hbWVQbHVzRXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZWxNYXAgJiYgcmVsTWFwLmlkLCB0cnVlKSwgZXh0LCAgdHJ1ZSk7XG5cdFx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0XHRkZWZpbmVkOiBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGhhc1Byb3AoZGVmaW5lZCwgbWFrZU1vZHVsZU1hcChpZCwgcmVsTWFwLCBmYWxzZSwgdHJ1ZSkuaWQpO1xuXHRcdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdFx0c3BlY2lmaWVkOiBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdFx0XHRcdFx0aWQgPSBtYWtlTW9kdWxlTWFwKGlkLCByZWxNYXAsIGZhbHNlLCB0cnVlKS5pZDtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGhhc1Byb3AoZGVmaW5lZCwgaWQpIHx8IGhhc1Byb3AocmVnaXN0cnksIGlkKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdGlmICghcmVsTWFwKSB7XG5cdFx0XHRcdFx0XHRsb2NhbFJlcXVpcmUudW5kZWYgPSBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdFx0XHRcdFx0Ly9CaW5kIGFueSB3YWl0aW5nIGRlZmluZSgpIGNhbGxzIHRvIHRoaXMgY29udGV4dCxcblx0XHRcdFx0XHRcdFx0Ly9maXggZm9yICM0MDhcblx0XHRcdFx0XHRcdFx0dGFrZUdsb2JhbFF1ZXVlKCk7XG5cblx0XHRcdFx0XHRcdFx0dmFyIG1hcCA9IG1ha2VNb2R1bGVNYXAoaWQsIHJlbE1hcCwgdHJ1ZSksXG5cdFx0XHRcdFx0XHRcdFx0bW9kID0gZ2V0T3duKHJlZ2lzdHJ5LCBpZCk7XG5cblx0XHRcdFx0XHRcdFx0bW9kLnVuZGVmZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRyZW1vdmVTY3JpcHQoaWQpO1xuXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBkZWZpbmVkW2lkXTtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIHVybEZldGNoZWRbbWFwLnVybF07XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB1bmRlZkV2ZW50c1tpZF07XG5cblx0XHRcdFx0XHRcdFx0ZWFjaFJldmVyc2UoZGVmUXVldWUsIGZ1bmN0aW9uKGFyZ3MsIGkpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAoYXJnc1swXSA9PT0gaWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGRlZlF1ZXVlLnNwbGljZShpLCAxKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0XHRkZWxldGUgY29udGV4dC5kZWZRdWV1ZU1hcFtpZF07XG5cblx0XHRcdFx0XHRcdFx0aWYgKG1vZCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChtb2QuZXZlbnRzLmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHVuZGVmRXZlbnRzW2lkXSA9IG1vZC5ldmVudHM7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdFx0Y2xlYW5SZWdpc3RyeShpZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0cmV0dXJuIGxvY2FsUmVxdWlyZTtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHRlbmFibGU6IGZ1bmN0aW9uIChkZXBNYXApIHtcblx0XHRcdFx0XHR2YXIgbW9kID0gZ2V0T3duKHJlZ2lzdHJ5LCBkZXBNYXAuaWQpO1xuXHRcdFx0XHRcdGlmIChtb2QpIHtcblx0XHRcdFx0XHRcdGdldE1vZHVsZShkZXBNYXApLmVuYWJsZSgpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSxcblxuXHRcdFx0XHRjb21wbGV0ZUxvYWQ6IGZ1bmN0aW9uIChtb2R1bGVOYW1lKSB7XG5cdFx0XHRcdFx0dmFyIGZvdW5kLCBhcmdzLCBtb2QsXG5cdFx0XHRcdFx0XHRzaGltID0gZ2V0T3duKGNvbmZpZy5zaGltLCBtb2R1bGVOYW1lKSB8fCB7fSxcblx0XHRcdFx0XHRcdHNoRXhwb3J0cyA9IHNoaW0uZXhwb3J0cztcblxuXHRcdFx0XHRcdHRha2VHbG9iYWxRdWV1ZSgpO1xuXG5cdFx0XHRcdFx0d2hpbGUgKGRlZlF1ZXVlLmxlbmd0aCkge1xuXHRcdFx0XHRcdFx0YXJncyA9IGRlZlF1ZXVlLnNoaWZ0KCk7XG5cdFx0XHRcdFx0XHRpZiAoYXJnc1swXSA9PT0gbnVsbCkge1xuXHRcdFx0XHRcdFx0XHRhcmdzWzBdID0gbW9kdWxlTmFtZTtcblx0XHRcdFx0XHRcdFx0aWYgKGZvdW5kKSB7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fSBlbHNlIGlmIChhcmdzWzBdID09PSBtb2R1bGVOYW1lKSB7XG5cdFx0XHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Y2FsbEdldE1vZHVsZShhcmdzKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0Y29udGV4dC5kZWZRdWV1ZU1hcCA9IHt9O1xuXG5cdFx0XHRcdFx0bW9kID0gZ2V0T3duKHJlZ2lzdHJ5LCBtb2R1bGVOYW1lKTtcblxuXHRcdFx0XHRcdGlmICghZm91bmQgJiYgIWhhc1Byb3AoZGVmaW5lZCwgbW9kdWxlTmFtZSkgJiYgbW9kICYmICFtb2QuaW5pdGVkKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29uZmlnLmVuZm9yY2VEZWZpbmUgJiYgKCFzaEV4cG9ydHMgfHwgIWdldEdsb2JhbChzaEV4cG9ydHMpKSkge1xuXHRcdFx0XHRcdFx0XHRpZiAoaGFzUGF0aEZhbGxiYWNrKG1vZHVsZU5hbWUpKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvbkVycm9yKG1ha2VFcnJvcignbm9kZWZpbmUnLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICdObyBkZWZpbmUgY2FsbCBmb3IgJyArIG1vZHVsZU5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgbnVsbCxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCBbbW9kdWxlTmFtZV0pKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0Y2FsbEdldE1vZHVsZShbbW9kdWxlTmFtZSwgKHNoaW0uZGVwcyB8fCBbXSksIHNoaW0uZXhwb3J0c0ZuXSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y2hlY2tMb2FkZWQoKTtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHRuYW1lVG9Vcmw6IGZ1bmN0aW9uIChtb2R1bGVOYW1lLCBleHQsIHNraXBFeHQpIHtcblx0XHRcdFx0XHR2YXIgcGF0aHMsIHN5bXMsIGksIHBhcmVudE1vZHVsZSwgdXJsLFxuXHRcdFx0XHRcdFx0cGFyZW50UGF0aCwgYnVuZGxlSWQsXG5cdFx0XHRcdFx0XHRwa2dNYWluID0gZ2V0T3duKGNvbmZpZy5wa2dzLCBtb2R1bGVOYW1lKTtcblxuXHRcdFx0XHRcdGlmIChwa2dNYWluKSB7XG5cdFx0XHRcdFx0XHRtb2R1bGVOYW1lID0gcGtnTWFpbjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRidW5kbGVJZCA9IGdldE93bihidW5kbGVzTWFwLCBtb2R1bGVOYW1lKTtcblxuXHRcdFx0XHRcdGlmIChidW5kbGVJZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuIGNvbnRleHQubmFtZVRvVXJsKGJ1bmRsZUlkLCBleHQsIHNraXBFeHQpO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmIChyZXEuanNFeHRSZWdFeHAudGVzdChtb2R1bGVOYW1lKSkge1xuXHRcdFx0XHRcdFx0dXJsID0gbW9kdWxlTmFtZSArIChleHQgfHwgJycpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRwYXRocyA9IGNvbmZpZy5wYXRocztcblxuXHRcdFx0XHRcdFx0c3ltcyA9IG1vZHVsZU5hbWUuc3BsaXQoJy8nKTtcblx0XHRcdFx0XHRcdGZvciAoaSA9IHN5bXMubGVuZ3RoOyBpID4gMDsgaSAtPSAxKSB7XG5cdFx0XHRcdFx0XHRcdHBhcmVudE1vZHVsZSA9IHN5bXMuc2xpY2UoMCwgaSkuam9pbignLycpO1xuXG5cdFx0XHRcdFx0XHRcdHBhcmVudFBhdGggPSBnZXRPd24ocGF0aHMsIHBhcmVudE1vZHVsZSk7XG5cdFx0XHRcdFx0XHRcdGlmIChwYXJlbnRQYXRoKSB7XG5cdFx0XHRcdFx0XHRcdFx0aWYgKGlzQXJyYXkocGFyZW50UGF0aCkpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudFBhdGggPSBwYXJlbnRQYXRoWzBdO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHRzeW1zLnNwbGljZSgwLCBpLCBwYXJlbnRQYXRoKTtcblx0XHRcdFx0XHRcdFx0XHRicmVhaztcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHR1cmwgPSBzeW1zLmpvaW4oJy8nKTtcblx0XHRcdFx0XHRcdHVybCArPSAoZXh0IHx8ICgvXmRhdGFcXFxcOnxeYmxvYlxcXFw6fFxcXFw/Ly50ZXN0KHVybCkgfHwgc2tpcEV4dCA/ICcnIDogJy5qcycpKTtcblx0XHRcdFx0XHRcdHVybCA9ICh1cmwuY2hhckF0KDApID09PSAnLycgfHwgdXJsLm1hdGNoKC9eW1xcXFx3XFxcXCtcXFxcLlxcXFwtXSs6LykgPyAnJyA6IGNvbmZpZy5iYXNlVXJsKSArIHVybDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gY29uZmlnLnVybEFyZ3MgJiYgIS9eYmxvYlxcXFw6Ly50ZXN0KHVybCkgP1xuXHRcdFx0XHRcdFx0ICAgdXJsICsgY29uZmlnLnVybEFyZ3MobW9kdWxlTmFtZSwgdXJsKSA6IHVybDtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHRsb2FkOiBmdW5jdGlvbiAoaWQsIHVybCkge1xuXHRcdFx0XHRcdHJlcS5sb2FkKGNvbnRleHQsIGlkLCB1cmwpO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGV4ZWNDYjogZnVuY3Rpb24gKG5hbWUsIGNhbGxiYWNrLCBhcmdzLCBleHBvcnRzKSB7XG5cdFx0XHRcdFx0cmV0dXJuIGNhbGxiYWNrLmFwcGx5KGV4cG9ydHMsIGFyZ3MpO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdG9uU2NyaXB0TG9hZDogZnVuY3Rpb24gKGV2dCkge1xuXHRcdFx0XHRcdGlmIChldnQudHlwZSA9PT0gJ2xvYWQnIHx8XG5cdFx0XHRcdFx0XHRcdChyZWFkeVJlZ0V4cC50ZXN0KChldnQuY3VycmVudFRhcmdldCB8fCBldnQuc3JjRWxlbWVudCkucmVhZHlTdGF0ZSkpKSB7XG5cdFx0XHRcdFx0XHRpbnRlcmFjdGl2ZVNjcmlwdCA9IG51bGw7XG5cblx0XHRcdFx0XHRcdHZhciBkYXRhID0gZ2V0U2NyaXB0RGF0YShldnQpO1xuXHRcdFx0XHRcdFx0Y29udGV4dC5jb21wbGV0ZUxvYWQoZGF0YS5pZCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdG9uU2NyaXB0RXJyb3I6IGZ1bmN0aW9uIChldnQpIHtcblx0XHRcdFx0XHR2YXIgZGF0YSA9IGdldFNjcmlwdERhdGEoZXZ0KTtcblx0XHRcdFx0XHRpZiAoIWhhc1BhdGhGYWxsYmFjayhkYXRhLmlkKSkge1xuXHRcdFx0XHRcdFx0dmFyIHBhcmVudHMgPSBbXTtcblx0XHRcdFx0XHRcdGVhY2hQcm9wKHJlZ2lzdHJ5LCBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG5cdFx0XHRcdFx0XHRcdGlmIChrZXkuaW5kZXhPZignX0ByJykgIT09IDApIHtcblx0XHRcdFx0XHRcdFx0XHRlYWNoKHZhbHVlLmRlcE1hcHMsIGZ1bmN0aW9uKGRlcE1hcCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGRlcE1hcC5pZCA9PT0gZGF0YS5pZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRwYXJlbnRzLnB1c2goa2V5KTtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0cmV0dXJuIG9uRXJyb3IobWFrZUVycm9yKCdzY3JpcHRlcnJvcicsICdTY3JpcHQgZXJyb3IgZm9yIFwiJyArIGRhdGEuaWQgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0IChwYXJlbnRzLmxlbmd0aCA/XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgJ1wiLCBuZWVkZWQgYnk6ICcgKyBwYXJlbnRzLmpvaW4oJywgJykgOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICdcIicpLCBldnQsIFtkYXRhLmlkXSkpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fTtcblxuXHRcdFx0Y29udGV4dC5yZXF1aXJlID0gY29udGV4dC5tYWtlUmVxdWlyZSgpO1xuXHRcdFx0cmV0dXJuIGNvbnRleHQ7XG5cdFx0fVxuXG5cdFx0cmVxID0gd2luZG93LnJlcXVpcmVqcyA9IGZ1bmN0aW9uIChkZXBzLCBjYWxsYmFjaywgZXJyYmFjaywgb3B0aW9uYWwpIHtcblxuXHRcdFx0dmFyIGNvbnRleHQsIGNvbmZpZyxcblx0XHRcdFx0Y29udGV4dE5hbWUgPSBkZWZDb250ZXh0TmFtZTtcblxuXHRcdFx0aWYgKCFpc0FycmF5KGRlcHMpICYmIHR5cGVvZiBkZXBzICE9PSAnc3RyaW5nJykge1xuXHRcdFx0XHRjb25maWcgPSBkZXBzO1xuXHRcdFx0XHRpZiAoaXNBcnJheShjYWxsYmFjaykpIHtcblx0XHRcdFx0XHRkZXBzID0gY2FsbGJhY2s7XG5cdFx0XHRcdFx0Y2FsbGJhY2sgPSBlcnJiYWNrO1xuXHRcdFx0XHRcdGVycmJhY2sgPSBvcHRpb25hbDtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRkZXBzID0gW107XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0aWYgKGNvbmZpZyAmJiBjb25maWcuY29udGV4dCkge1xuXHRcdFx0XHRjb250ZXh0TmFtZSA9IGNvbmZpZy5jb250ZXh0O1xuXHRcdFx0fVxuXG5cdFx0XHRjb250ZXh0ID0gZ2V0T3duKGNvbnRleHRzLCBjb250ZXh0TmFtZSk7XG5cdFx0XHRpZiAoIWNvbnRleHQpIHtcblx0XHRcdFx0Y29udGV4dCA9IGNvbnRleHRzW2NvbnRleHROYW1lXSA9IHJlcS5zLm5ld0NvbnRleHQoY29udGV4dE5hbWUpO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29uZmlnKSB7XG5cdFx0XHRcdGNvbnRleHQuY29uZmlndXJlKGNvbmZpZyk7XG5cdFx0XHR9XG5cblx0XHRcdHJldHVybiBjb250ZXh0LnJlcXVpcmUoZGVwcywgY2FsbGJhY2ssIGVycmJhY2spO1xuXHRcdH07XG5cblx0XHRyZXEuY29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXHRcdFx0cmV0dXJuIHJlcShjb25maWcpO1xuXHRcdH07XG5cblx0XHRyZXEubmV4dFRpY2sgPSB0eXBlb2Ygc2V0VGltZW91dCAhPT0gJ3VuZGVmaW5lZCcgPyBmdW5jdGlvbiAoZm4pIHtcblx0XHRcdHNldFRpbWVvdXQoZm4sIDQpO1xuXHRcdH0gOiBmdW5jdGlvbiAoZm4pIHsgZm4oKTsgfTtcblxuXHRcdGlmICghd2luZG93LnJlcXVpcmUpIHtcblx0XHRcdHdpbmRvdy5yZXF1aXJlID0gcmVxO1xuXHRcdH1cblxuXHRcdHJlcS52ZXJzaW9uID0gdmVyc2lvbjtcblxuXHRcdHJlcS5qc0V4dFJlZ0V4cCA9IC9eXFxcXC98OnxcXFxcP3xcXFxcLmpzJC87XG5cdFx0cmVxLmlzQnJvd3NlciA9IGlzQnJvd3Nlcjtcblx0XHRzID0gcmVxLnMgPSB7XG5cdFx0XHRjb250ZXh0czogY29udGV4dHMsXG5cdFx0XHRuZXdDb250ZXh0OiBuZXdDb250ZXh0XG5cdFx0fTtcblxuXHRcdHJlcSh7fSk7XG5cblx0XHRlYWNoKFtcblx0XHRcdCd0b1VybCcsXG5cdFx0XHQndW5kZWYnLFxuXHRcdFx0J2RlZmluZWQnLFxuXHRcdFx0J3NwZWNpZmllZCdcblx0XHRdLCBmdW5jdGlvbiAocHJvcCkge1xuXHRcdFx0cmVxW3Byb3BdID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgY3R4ID0gY29udGV4dHNbZGVmQ29udGV4dE5hbWVdO1xuXHRcdFx0XHRyZXR1cm4gY3R4LnJlcXVpcmVbcHJvcF0uYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdGhlYWQgPSBzLmhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuXHRcdFx0YmFzZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYmFzZScpWzBdO1xuXHRcdFx0aWYgKGJhc2VFbGVtZW50KSB7XG5cdFx0XHRcdGhlYWQgPSBzLmhlYWQgPSBiYXNlRWxlbWVudC5wYXJlbnROb2RlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdHJlcS5vbkVycm9yID0gZGVmYXVsdE9uRXJyb3I7XG5cblx0XHRyZXEuY3JlYXRlTm9kZSA9IGZ1bmN0aW9uIChjb25maWcsIG1vZHVsZU5hbWUsIHVybCkge1xuXHRcdFx0dmFyIG5vZGUgPSBjb25maWcueGh0bWwgP1xuXHRcdFx0XHRcdGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsICdodG1sOnNjcmlwdCcpIDpcblx0XHRcdFx0XHRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblx0XHRcdG5vZGUudHlwZSA9IGNvbmZpZy5zY3JpcHRUeXBlIHx8ICd0ZXh0L2phdmFzY3JpcHQnO1xuXHRcdFx0bm9kZS5jaGFyc2V0ID0gJ3V0Zi04Jztcblx0XHRcdG5vZGUuYXN5bmMgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIG5vZGU7XG5cdFx0fTtcblxuXHRcdHJlcS5sb2FkID0gZnVuY3Rpb24gKGNvbnRleHQsIG1vZHVsZU5hbWUsIHVybCkge1xuXHRcdFx0dmFyIGNvbmZpZyA9IChjb250ZXh0ICYmIGNvbnRleHQuY29uZmlnKSB8fCB7fSxcblx0XHRcdFx0bm9kZTtcblx0XHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdFx0bm9kZSA9IHJlcS5jcmVhdGVOb2RlKGNvbmZpZywgbW9kdWxlTmFtZSwgdXJsKTtcblxuXHRcdFx0XHRub2RlLnNldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlY29udGV4dCcsIGNvbnRleHQuY29udGV4dE5hbWUpO1xuXHRcdFx0XHRub2RlLnNldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlbW9kdWxlJywgbW9kdWxlTmFtZSk7XG5cblx0XHRcdFx0aWYgKG5vZGUuYXR0YWNoRXZlbnQgJiZcblx0XHRcdFx0XHRcdCEobm9kZS5hdHRhY2hFdmVudC50b1N0cmluZyAmJiBub2RlLmF0dGFjaEV2ZW50LnRvU3RyaW5nKCkuaW5kZXhPZignW25hdGl2ZSBjb2RlJykgPCAwKSAmJlxuXHRcdFx0XHRcdFx0IWlzT3BlcmEpIHtcblx0XHRcdFx0XHR1c2VJbnRlcmFjdGl2ZSA9IHRydWU7XG5cblx0XHRcdFx0XHRub2RlLmF0dGFjaEV2ZW50KCdvbnJlYWR5c3RhdGVjaGFuZ2UnLCBjb250ZXh0Lm9uU2NyaXB0TG9hZCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0bm9kZS5hZGRFdmVudExpc3RlbmVyKCdsb2FkJywgY29udGV4dC5vblNjcmlwdExvYWQsIGZhbHNlKTtcblx0XHRcdFx0XHRub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2Vycm9yJywgY29udGV4dC5vblNjcmlwdEVycm9yLCBmYWxzZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0bm9kZS5zcmMgPSB1cmw7XG5cblx0XHRcdFx0aWYgKGNvbmZpZy5vbk5vZGVDcmVhdGVkKSB7XG5cdFx0XHRcdFx0Y29uZmlnLm9uTm9kZUNyZWF0ZWQobm9kZSwgY29uZmlnLCBtb2R1bGVOYW1lLCB1cmwpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Y3VycmVudGx5QWRkaW5nU2NyaXB0ID0gbm9kZTtcblx0XHRcdFx0aWYgKGJhc2VFbGVtZW50KSB7XG5cdFx0XHRcdFx0aGVhZC5pbnNlcnRCZWZvcmUobm9kZSwgYmFzZUVsZW1lbnQpO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGhlYWQuYXBwZW5kQ2hpbGQobm9kZSk7XG5cdFx0XHRcdH1cblx0XHRcdFx0Y3VycmVudGx5QWRkaW5nU2NyaXB0ID0gbnVsbDtcblxuXHRcdFx0XHRyZXR1cm4gbm9kZTtcblx0XHRcdH0gZWxzZSBpZiAoaXNXZWJXb3JrZXIpIHtcblx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge30sIDApO1xuXHRcdFx0XHRcdGltcG9ydFNjcmlwdHModXJsKTtcblxuXHRcdFx0XHRcdGNvbnRleHQuY29tcGxldGVMb2FkKG1vZHVsZU5hbWUpO1xuXHRcdFx0XHR9IGNhdGNoIChlKSB7XG5cdFx0XHRcdFx0Y29udGV4dC5vbkVycm9yKG1ha2VFcnJvcignaW1wb3J0c2NyaXB0cycsXG5cdFx0XHRcdFx0XHRcdFx0XHQnaW1wb3J0U2NyaXB0cyBmYWlsZWQgZm9yICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRtb2R1bGVOYW1lICsgJyBhdCAnICsgdXJsLFxuXHRcdFx0XHRcdFx0XHRcdFx0ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFttb2R1bGVOYW1lXSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fTtcblxuXHRcdGZ1bmN0aW9uIGdldEludGVyYWN0aXZlU2NyaXB0KCkge1xuXHRcdFx0aWYgKGludGVyYWN0aXZlU2NyaXB0ICYmIGludGVyYWN0aXZlU2NyaXB0LnJlYWR5U3RhdGUgPT09ICdpbnRlcmFjdGl2ZScpIHtcblx0XHRcdFx0cmV0dXJuIGludGVyYWN0aXZlU2NyaXB0O1xuXHRcdFx0fVxuXG5cdFx0XHRlYWNoUmV2ZXJzZShzY3JpcHRzKCksIGZ1bmN0aW9uIChzY3JpcHQpIHtcblx0XHRcdFx0aWYgKHNjcmlwdC5yZWFkeVN0YXRlID09PSAnaW50ZXJhY3RpdmUnKSB7XG5cdFx0XHRcdFx0cmV0dXJuIChpbnRlcmFjdGl2ZVNjcmlwdCA9IHNjcmlwdCk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGludGVyYWN0aXZlU2NyaXB0O1xuXHRcdH1cblxuXHRcdGlmIChpc0Jyb3dzZXIgJiYgIWNmZy5za2lwRGF0YU1haW4pIHtcblx0XHRcdGVhY2hSZXZlcnNlKHNjcmlwdHMoKSwgZnVuY3Rpb24gKHNjcmlwdCkge1xuXHRcdFx0XHRpZiAoIWhlYWQpIHtcblx0XHRcdFx0XHRoZWFkID0gc2NyaXB0LnBhcmVudE5vZGU7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRkYXRhTWFpbiA9IHNjcmlwdC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbWFpbicpO1xuXHRcdFx0XHRpZiAoZGF0YU1haW4pIHtcblx0XHRcdFx0XHRtYWluU2NyaXB0ID0gZGF0YU1haW47XG5cblx0XHRcdFx0XHRpZiAoIWNmZy5iYXNlVXJsICYmIG1haW5TY3JpcHQuaW5kZXhPZignIScpID09PSAtMSkge1xuXHRcdFx0XHRcdFx0c3JjID0gbWFpblNjcmlwdC5zcGxpdCgnLycpO1xuXHRcdFx0XHRcdFx0bWFpblNjcmlwdCA9IHNyYy5wb3AoKTtcblx0XHRcdFx0XHRcdHN1YlBhdGggPSBzcmMubGVuZ3RoID8gc3JjLmpvaW4oJy8nKSAgKyAnLycgOiAnLi8nO1xuXG5cdFx0XHRcdFx0XHRjZmcuYmFzZVVybCA9IHN1YlBhdGg7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0bWFpblNjcmlwdCA9IG1haW5TY3JpcHQucmVwbGFjZShqc1N1ZmZpeFJlZ0V4cCwgJycpO1xuXG5cdFx0XHRcdFx0aWYgKHJlcS5qc0V4dFJlZ0V4cC50ZXN0KG1haW5TY3JpcHQpKSB7XG5cdFx0XHRcdFx0XHRtYWluU2NyaXB0ID0gZGF0YU1haW47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Y2ZnLmRlcHMgPSBjZmcuZGVwcyA/IGNmZy5kZXBzLmNvbmNhdChtYWluU2NyaXB0KSA6IFttYWluU2NyaXB0XTtcblxuXHRcdFx0XHRcdHJldHVybiB0cnVlO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9XG5cblx0XHR3aW5kb3cuZGVmaW5lID0gZnVuY3Rpb24gKG5hbWUsIGRlcHMsIGNhbGxiYWNrKSB7XG5cdFx0XHR2YXIgbm9kZSwgY29udGV4dDtcblxuXHRcdFx0aWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuXHRcdFx0XHQvL0FkanVzdCBhcmdzIGFwcHJvcHJpYXRlbHlcblx0XHRcdFx0Y2FsbGJhY2sgPSBkZXBzO1xuXHRcdFx0XHRkZXBzID0gbmFtZTtcblx0XHRcdFx0bmFtZSA9IG51bGw7XG5cdFx0XHR9XG5cblx0XHRcdGlmICghaXNBcnJheShkZXBzKSkge1xuXHRcdFx0XHRjYWxsYmFjayA9IGRlcHM7XG5cdFx0XHRcdGRlcHMgPSBudWxsO1xuXHRcdFx0fVxuXG5cdFx0XHRpZiAoIWRlcHMgJiYgaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcblx0XHRcdFx0ZGVwcyA9IFtdO1xuXHRcdFx0XHRpZiAoY2FsbGJhY2subGVuZ3RoKSB7XG5cdFx0XHRcdFx0Y2FsbGJhY2tcblx0XHRcdFx0XHRcdC50b1N0cmluZygpXG5cdFx0XHRcdFx0XHQucmVwbGFjZShjb21tZW50UmVnRXhwLCBjb21tZW50UmVwbGFjZSlcblx0XHRcdFx0XHRcdC5yZXBsYWNlKGNqc1JlcXVpcmVSZWdFeHAsIGZ1bmN0aW9uIChtYXRjaCwgZGVwKSB7XG5cdFx0XHRcdFx0XHRcdGRlcHMucHVzaChkZXApO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRkZXBzID0gKGNhbGxiYWNrLmxlbmd0aCA9PT0gMSA/IFsncmVxdWlyZSddIDogWydyZXF1aXJlJywgJ2V4cG9ydHMnLCAnbW9kdWxlJ10pLmNvbmNhdChkZXBzKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cblx0XHRcdGlmIChjb250ZXh0KSB7XG5cdFx0XHRcdGNvbnRleHQuZGVmUXVldWUucHVzaChbbmFtZSwgZGVwcywgY2FsbGJhY2tdKTtcblx0XHRcdFx0Y29udGV4dC5kZWZRdWV1ZU1hcFtuYW1lXSA9IHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRnbG9iYWxEZWZRdWV1ZS5wdXNoKFtuYW1lLCBkZXBzLCBjYWxsYmFja10pO1xuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRkZWZpbmUuYW1kID0ge1xuXHRcdFx0alF1ZXJ5OiB0cnVlXG5cdFx0fTtcblxuXHRcdC8vU2V0IHVwIHdpdGggY29uZmlnIGluZm8uXG5cdFx0cmVxKGNmZyk7XG5cdH0odGhpcywgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IHNldFRpbWVvdXQpKSk7XG4gICBgKTtcbiAgICBydW50aW1lLnB1c2goJ1xcbi8vLy9cXG4nKTtcbiAgICBydW50aW1lLnB1c2goY3JlYXRlSW1wb3J0TWFwKG1vZGVsLCBwYXRoLCBtb2RlbC5mbGFncy5yZW1hcEltcG9ydFNvdXJjZSkpO1xuICAgIHJ1bnRpbWUucHVzaCgnXFxuJyk7XG4gICAgcnVudGltZS5wdXNoKGByZXF1aXJlanMuY29uZmlnKHtwYXRoczppbXBvcnREYXRhfSlgKTtcbiAgICBydW50aW1lLnB1c2goJ1xcbicpO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVOb2RlSnNSdW50aW1lKG1vZGVsLCBydW50aW1lLCBwYXRoKSB7XG4gICAgaWYgKG1vZGVsLnByb2plY3QucHJvamVjdERlcGVuZGVuY2llcy5zaXplKSB7XG4gICAgICAgIHJ1bnRpbWUucHVzaChgXG4ke2NyZWF0ZUltcG9ydE1hcChtb2RlbCwgcGF0aCwgbW9kZWwuZmxhZ3MucmVtYXBJbXBvcnRTb3VyY2UpfVxuY29uc3QgbW9kID0gcmVxdWlyZSgnbW9kdWxlJyk7XG5cbmNvbnN0IG9yaWdpbmFsID0gbW9kLnByb3RvdHlwZS5yZXF1aXJlO1xubW9kLnByb3RvdHlwZS5yZXF1aXJlID0gZnVuY3Rpb24ocGF0aCwgLi4uYXJncykge1xuXHRpZiAoaW1wb3J0RGF0YVtwYXRoXSkge1xuXHRcdHBhdGggPSBpbXBvcnREYXRhW3BhdGhdO1xuXHRcdHJldHVybiBvcmlnaW5hbC5jYWxsKG1vZHVsZSwgcGF0aCwgLi4uYXJncyk7XG5cdH0gZWxzZSB7XG5cdFx0cmV0dXJuIG9yaWdpbmFsLmNhbGwodGhpcywgcGF0aCwgLi4uYXJncyk7XG5cdH1cbn07XG5gKTtcbiAgICB9XG59XG5mdW5jdGlvbiBjcmVhdGVJbXBvcnRNYXAobW9kZWwsIHBhdGgsIHJlbWFwKSB7XG4gICAgY29uc3QgcmVzdWx0ID0gW107XG4gICAgZm9yIChjb25zdCBkZXAgb2YgbW9kZWwucHJvamVjdC5wcm9qZWN0RGVwZW5kZW5jaWVzKSB7XG4gICAgICAgIGlmIChyZW1hcCkge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goYCcke2RlcC5yZXNvbHZlZENvbmZpZy5uYW1lfSc6ICcke3BhdGhfMS5qb2luKHJlbWFwLCBkZXAucmVzb2x2ZWRDb25maWcubmFtZSl9J2ApO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0LnB1c2goYCcke2RlcC5yZXNvbHZlZENvbmZpZy5uYW1lfSc6ICcke3BhdGhfMS5yZWxhdGl2ZShwYXRoXzEucGFyc2UocGF0aCkuZGlyLCBkZXAucGF0aCl9J2ApO1xuICAgICAgICB9XG4gICAgfVxuICAgIGZvciAoY29uc3QgZGVwIG9mIG1vZGVsLnByb2plY3QuZmlsZURlcGVuZGVuY2llcy5rZXlzKCkpIHtcbiAgICAgICAgbGV0IGRlcFBhdGggPSBtb2RlbC5wcm9qZWN0LmZpbGVEZXBlbmRlbmNpZXMuZ2V0KGRlcCk7XG4gICAgICAgIGlmIChtb2RlbC5wcm9qZWN0LnJlc29sdmVkQ29uZmlnLnBsYXRmb3JtID09PSAnYnJvd3NlcicpIHtcbiAgICAgICAgICAgIGRlcFBhdGggPSBgJHttb2RlbC5wcm9qZWN0LnJlc29sdmVkQ29uZmlnLmJ1aWxkLmJ1bmRsZXNbbW9kZWwuYnVuZGxlXS5vdXRwdXR9LyR7ZGVwUGF0aH1gO1xuICAgICAgICAgICAgZGVwUGF0aCA9IGRlcFBhdGguZW5kc1dpdGgoJy5qcycpID8gZGVwUGF0aC5zdWJzdHJpbmcoMCwgZGVwUGF0aC5sZW5ndGggLSAzKSA6IGRlcFBhdGg7XG4gICAgICAgIH1cbiAgICAgICAgcmVzdWx0LnB1c2goYCcke2RlcH0nOiAnJHtkZXBQYXRofSdgKTtcbiAgICB9XG4gICAgcmV0dXJuIGBjb25zdCBpbXBvcnREYXRhID0geyR7cmVzdWx0LmpvaW4oJywnKX19YDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNuVnVkR2x0WlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbkoxYm5ScGJXVXVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3UVVGQlFTd3JRa0ZCTmtNN1FVRkROME1zVTBGQlowSXNUMEZCVHl4RFFVRkRMRWxCUVVrN1NVRkRlRUlzVDBGQlR5eExRVUZMTEVWQlFVVXNTMEZCU3l4RlFVRkZMRTlCUVU4c1JVRkJSU3hGUVVGRk8xRkJRelZDTEVsQlFVa3NSVUZCUlN4RFFVRkRPMUZCUTFBc1NVRkJTU3hKUVVGSkxFZEJRVWNzVjBGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTTVReXhKUVVGSkxHTkJRV01zUjBGQlJ5eERRVUZETEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU1zUlVGQlJTeExRVUZMTEVsQlFVa3NTVUZCU1N4RlFVRkZMRXRCUVVzc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU5xUnl4SlFVRkpMRTlCUVU4c1IwRkJSeXhsUVVGbExFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOcVJDeE5RVUZOTEUxQlFVMHNSMEZCUnl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlEyaERMRWxCUVVrc1RVRkJUU3hMUVVGTExFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSVHRaUVVOeVF5eEpRVUZKTEZGQlFWRXNRMEZCUXp0WlFVTmlMRkZCUVZFc1kwRkJZeXhGUVVGRk8yZENRVU53UWl4TFFVRkxMRkZCUVZFN2IwSkJRMVFzVVVGQlVTeEhRVUZITEUxQlFVMHNTMEZCU3l4RFFVRkRMRlZCUVZVc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRPMjlDUVVONlJDeE5RVUZOTEV0QlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEZGQlFWRXNTMEZCU3l4TlFVRk5MRVZCUVVVc1EwRkJReXhEUVVGRE8yOUNRVU5xUlN4TlFVRk5PMmRDUVVOV0xFdEJRVXNzVTBGQlV6dHZRa0ZEVml4TlFVRk5MRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJRenR2UWtGREwwTXNUVUZCVFR0blFrRkRWaXhMUVVGTExGTkJRVk03YjBKQlExWXNVVUZCVVN4SFFVRkhMRTFCUVUwc1MwRkJTeXhEUVVGRExGVkJRVlVzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRE8yOUNRVU42UkN4TlFVRk5MRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkhMRTFCUVUwc1MwRkJTeXhSUVVGUkxFVkJRVVVzUTBGQlF5eERRVUZETzI5Q1FVTnFSU3hOUVVGTk8yRkJRMkk3VTBGRFNqdGhRVU5KTzFsQlEwUXNUVUZCVFN4TFFVRkxMRU5CUVVNc1ZVRkJWU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1UwRkRiRVE3VVVGRFJDeFBRVUZQTEV0QlFVc3NRMEZCUXp0SlFVTnFRaXhEUVVGRExFTkJRVU03UVVGRFRpeERRVUZETzBGQk5VSkVMREJDUVRSQ1F6dEJRVU5FTEZOQlFWTXNaVUZCWlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExFVkJRVVVzU1VGQlNUdEpRVU4wUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRKUVVOUUxFbEJRVWtzVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNTMEZCU3l4SlFVRkpMRWxCUVVrc1JVRkJSU3hMUVVGTExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTTNSU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNZMEZCWXl4RFFVRkRMRkZCUVZFc1MwRkJTeXhUUVVGVExFVkJRVVU3VVVGRGNrUXNjMEpCUVhOQ0xFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRMUVVOb1JEdFRRVU5KTzFGQlEwUXNjVUpCUVhGQ0xFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRMUVVNdlF6dEpRVU5FTEVsQlFVa3NTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSVHRSUVVOaUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8wdEJRemRDTzBsQlEwUXNUMEZCVHl4UFFVRlBMRU5CUVVNN1FVRkRia0lzUTBGQlF6dEJRVU5FTEZOQlFWTXNjMEpCUVhOQ0xFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpPMGxCUTJoRUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTTdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3U1VGbmNVUmlMRU5CUVVNc1EwRkJRenRKUVVOR0xFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNWVUZCVlN4RFFVRkRMRU5CUVVNN1NVRkRla0lzVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXl4bFFVRmxMRU5CUVVNc1MwRkJTeXhGUVVGRkxFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNTMEZCU3l4RFFVRkRMR2xDUVVGcFFpeERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTXhSU3hQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMGxCUTI1Q0xFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNjME5CUVhORExFTkJRVU1zUTBGQlF6dEpRVU55UkN4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzBGQlEzWkNMRU5CUVVNN1FVRkRSQ3hUUVVGVExIRkNRVUZ4UWl4RFFVRkRMRXRCUVVzc1JVRkJSU3hQUVVGUExFVkJRVVVzU1VGQlNUdEpRVU12UXl4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zYlVKQlFXMUNMRU5CUVVNc1NVRkJTU3hGUVVGRk8xRkJRM2hETEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNN1JVRkRia0lzWlVGQlpTeERRVUZETEV0QlFVc3NSVUZCUlN4SlFVRkpMRVZCUVVVc1MwRkJTeXhEUVVGRExFdEJRVXNzUTBGQlF5eHBRa0ZCYVVJc1EwRkJRenM3T3pzN096czdPenM3TzBOQldUVkVMRU5CUVVNc1EwRkJRenRMUVVORk8wRkJRMHdzUTBGQlF6dEJRVU5FTEZOQlFWTXNaVUZCWlN4RFFVRkRMRXRCUVVzc1JVRkJSU3hKUVVGSkxFVkJRVVVzUzBGQlN6dEpRVU4yUXl4TlFVRk5MRTFCUVUwc1IwRkJSeXhGUVVGRkxFTkJRVU03U1VGRGJFSXNTMEZCU3l4TlFVRk5MRWRCUVVjc1NVRkJTU3hMUVVGTExFTkJRVU1zVDBGQlR5eERRVUZETEcxQ1FVRnRRaXhGUVVGRk8xRkJRMnBFTEVsQlFVa3NTMEZCU3l4RlFVRkZPMWxCUTFBc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hQUVVGUExGZEJRVWtzUTBGQlF5eExRVUZMTEVWQlFVVXNSMEZCUnl4RFFVRkRMR05CUVdNc1EwRkJReXhKUVVGSkxFTkJRVU1zUjBGQlJ5eERRVUZETEVOQlFVTTdVMEZETVVZN1lVRkRTVHRaUVVORUxFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4SFFVRkhMRU5CUVVNc1kwRkJZeXhEUVVGRExFbEJRVWtzVDBGQlR5eGxRVUZSTEVOQlFVTXNXVUZCU3l4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFZEJRVWNzUlVGQlJTeEhRVUZITEVOQlFVTXNTVUZCU1N4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRE8xTkJRM3BHTzB0QlEwbzdTVUZEUkN4TFFVRkxMRTFCUVUwc1IwRkJSeXhKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNaMEpCUVdkQ0xFTkJRVU1zU1VGQlNTeEZRVUZGTEVWQlFVVTdVVUZEY2tRc1NVRkJTU3hQUVVGUExFZEJRVWNzUzBGQlN5eERRVUZETEU5QlFVOHNRMEZCUXl4blFrRkJaMElzUTBGQlF5eEhRVUZITEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1VVRkRkRVFzU1VGQlNTeExRVUZMTEVOQlFVTXNUMEZCVHl4RFFVRkRMR05CUVdNc1EwRkJReXhSUVVGUkxFdEJRVXNzVTBGQlV5eEZRVUZGTzFsQlEzSkVMRTlCUVU4c1IwRkJSeXhIUVVGSExFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNZMEZCWXl4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zUzBGQlN5eERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRTFCUVUwc1NVRkJTU3hQUVVGUExFVkJRVVVzUTBGQlF6dFpRVU14Uml4UFFVRlBMRWRCUVVjc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eExRVUZMTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1QwRkJUeXhEUVVGRExGTkJRVk1zUTBGQlF5eERRVUZETEVWQlFVVXNUMEZCVHl4RFFVRkRMRTFCUVUwc1IwRkJSeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNUMEZCVHl4RFFVRkRPMU5CUXpGR08xRkJRMFFzVFVGQlRTeERRVUZETEVsQlFVa3NRMEZCUXl4SlFVRkpMRWRCUVVjc1QwRkJUeXhQUVVGUExFZEJRVWNzUTBGQlF5eERRVUZETzB0QlEzcERPMGxCUTBRc1QwRkJUeXgxUWtGQmRVSXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETzBGQlEzUkVMRU5CUVVNaWZRPT0iXX0=