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
			//PS3 indicates loaded and complete, but need to wait for complete
			//specifically. Sequence is 'loading', 'loaded', execution,
			// then 'complete'. The UA check is unfortunate, but not sure how
			//to feature test w/o causing perf issues.
			readyRegExp = isBrowser && navigator.platform === 'PLAYSTATION 3' ?
						  /^complete$/ : /^(complete|loaded)$/,
			defContextName = '_',
			//Oh the tragedy, detecting opera. See the usage of isOpera for reason.
			isOpera = typeof opera !== 'undefined' && opera.toString() === '[object Opera]',
			contexts = {},
			cfg = {},
			globalDefQueue = [],
			useInteractive = false;

		//Could match something like ')//comment', do not lose the prefix to comment.
		function commentReplace(match, singlePrefix) {
			return singlePrefix || '';
		}

		function isFunction(it) {
			return ostring.call(it) === '[object Function]';
		}

		function isArray(it) {
			return ostring.call(it) === '[object Array]';
		}

		/**
		 * Helper function for iterating over an array. If the func returns
		 * a true value, it will break out of the loop.
		 */
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

		/**
		 * Helper function for iterating over an array backwards. If the func
		 * returns a true value, it will break out of the loop.
		 */
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

		/**
		 * Cycles over properties in an object and calls a function for each
		 * property value. If the function returns a truthy value, then the
		 * iteration is stopped.
		 */
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

		/**
		 * Simple function to mix in properties from source into target,
		 * but only if target does not already have a property of the same name.
		 */
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

		//Similar to Function.prototype.bind, but the 'this' object is specified
		//first, since it is easier to read/figure out what 'this' will be.
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
					//Pop off the first array value, since it failed, and
					//retry
					pathConfig.shift();
					context.require.undef(id);

					//Custom require that does not do map translation, since
					//ID is "absolute", already mapped/resolved.
					context.makeRequire(null, {
						skipMap: true
					})([id]);

					return true;
				}
			}

			//Turns a plugin!resource to [plugin, resource]
			//with the plugin being undefined if the name
			//did not have a plugin prefix.
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
						//The factory could trigger another require call
						//that would result in checking this module to
						//define itself again. If already in the process
						//of doing that, skip this work.
						this.defining = true;

						if (this.depCount < 1 && !this.defined) {
							if (isFunction(factory)) {
								//If there is an error listener, favor passing
								//to that instead of throwing an error. However,
								//only do it for define()'d  modules. require
								//errbacks should not be called for failures in
								//their callbacks (#699). However if a global
								//onError is set, use that.
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

								// Favor return value over exports. If node/cjs in play,
								// then will not have a return value anyway. Favor
								// module.exports assignment over exports object.
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
								//Just a literal value
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

						//Finished the define stage. Allow calling check again
						//to allow define notifications below in the case of a
						//cycle.
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
						//Map already normalized the prefix.
						pluginMap = makeModuleMap(map.prefix);

					//Mark this as a dependency for this plugin, so it
					//can be traced for cycles.
					this.depMaps.push(pluginMap);

					on(pluginMap, 'defined', bind(this, function (plugin) {
						var load, normalizedMap, normalizedMod,
							bundleId = getOwn(bundlesMap, this.map.id),
							name = this.map.name,
							parentName = this.map.parentMap ? this.map.parentMap.name : null,
							localRequire = context.makeRequire(map.parentMap, {
								enableBuildCallback: true
							});

						//If current map is not normalized, wait for that
						//normalized name to load instead of continuing.
						if (this.map.unnormalized) {
							//Normalize the ID if the plugin allows it.
							if (plugin.normalize) {
								name = plugin.normalize(name, function (name) {
									return normalize(name, parentName, true);
								}) || '';
							}

							//prefix and name should already be normalized, no need
							//for applying map config again either.
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
								//Mark this as a dependency for this plugin, so it
								//can be traced for cycles.
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

						//If a paths config, then just load that file instead to
						//resolve the plugin, as it is built into that paths layer.
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

							//Remove temp unnormalized modules for this module,
							//since they will never be resolved otherwise now.
							eachProp(registry, function (mod) {
								if (mod.map.id.indexOf(id + '_unnormalized') === 0) {
									cleanRegistry(mod.map.id);
								}
							});

							onError(err);
						});

						//Allow plugins to load other code without having to know the
						//context or how to 'complete' the load.
						load.fromText = bind(this, function (text, textAlt) {
							/*jslint evil: true */
							var moduleName = map.name,
								moduleMap = makeModuleMap(moduleName),
								hasInteractive = useInteractive;

							//As of 2.1.0, support just passing the text, to reinforce
							//fromText only being called once per resource. Still
							//support old style of passing moduleName but discard
							//that moduleName in favor of the internal ref.
							if (textAlt) {
								text = textAlt;
							}

							//Turn off interactive script matching for IE for any define
							//calls in the text, then turn it back on at the end.
							if (hasInteractive) {
								useInteractive = false;
							}

							//Prime the system by creating a module instance for
							//it.
							getModule(moduleMap);

							//Transfer any config to this other module.
							if (hasProp(config.config, id)) {
								config.config[moduleName] = config.config[id];
							}

							try {
								req.exec(text);
							} catch (e) {
								return onError(makeError('fromtexteval',
												 'fromText eval for ' + id +
												' failed: ' + e,
												 e,
												 [id]));
							}

							if (hasInteractive) {
								useInteractive = true;
							}

							//Mark this as a dependency for the plugin
							//resource
							this.depMaps.push(moduleMap);

							//Support anonymous modules.
							context.completeLoad(moduleName);

							//Bind the value of that module to the value for this
							//resource ID.
							localRequire([moduleName], load);
						});

						//Use parentName here since the plugin's name is not reliable,
						//could be some weird string with no path that actually wants to
						//reference the parentName's path.
						plugin.load(map.name, localRequire, load, config);
					}));

					context.enable(pluginMap, this);
					this.pluginMaps[pluginMap.id] = pluginMap;
				},

				enable: function () {
					enabledRegistry[this.map.id] = this;
					this.enabled = true;

					//Set flag mentioning that the module is enabling,
					//so that immediate calls to the defined callbacks
					//for dependencies do not trigger inadvertent load
					//with the depCount still being zero.
					this.enabling = true;

					//Enable each dependency
					each(this.depMaps, bind(this, function (depMap, i) {
						var id, mod, handler;

						if (typeof depMap === 'string') {
							//Dependency needs to be converted to a depMap
							//and wired up to this module.
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
								// No direct errback on this module, but something
								// else is listening for errors, so be sure to
								// propagate the error correctly.
								on(depMap, 'error', bind(this, function(err) {
									this.emit('error', err);
								}));
							}
						}

						id = depMap.id;
						mod = registry[id];

						//Skip special modules like 'require', 'exports', 'module'
						//Also, don't call enable if it is already enabled,
						//important in circular dependency cases.
						if (!hasProp(handlers, id) && mod && !mod.enabled) {
							context.enable(depMap, this);
						}
					}));

					//Enable each plugin that is used in
					//a dependency
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

				//Any defined modules in the global queue, intake them now.
				takeGlobalQueue();

				//Make sure any remaining defQueue items get properly processed.
				while (defQueue.length) {
					args = defQueue.shift();
					if (args[0] === null) {
						return onError(makeError('mismatch', 'Mismatched anonymous define() module: ' +
							args[args.length - 1]));
					} else {
						//args are id, deps, factory. Should be normalized by the
						//define() function.
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

				/**
				 * Set a configuration for the context.
				 * @param {Object} cfg config object to integrate.
				 */
				configure: function (cfg) {
					//Make sure the baseUrl ends in a slash.
					if (cfg.baseUrl) {
						if (cfg.baseUrl.charAt(cfg.baseUrl.length - 1) !== '/') {
							cfg.baseUrl += '/';
						}
					}

					// Convert old style urlArgs string to a function.
					if (typeof cfg.urlArgs === 'string') {
						var urlArgs = cfg.urlArgs;
						cfg.urlArgs = function(id, url) {
							return (url.indexOf('?') === -1 ? '?' : '&') + urlArgs;
						};
					}

					//Save off the paths since they require special processing,
					//they are additive.
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

					//Reverse map the bundles
					if (cfg.bundles) {
						eachProp(cfg.bundles, function (value, prop) {
							each(value, function (v) {
								if (v !== prop) {
									bundlesMap[v] = prop;
								}
							});
						});
					}

					//Merge shim
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

					//Adjust packages if necessary.
					if (cfg.packages) {
						each(cfg.packages, function (pkgObj) {
							var location, name;

							pkgObj = typeof pkgObj === 'string' ? {name: pkgObj} : pkgObj;

							name = pkgObj.name;
							location = pkgObj.location;
							if (location) {
								config.paths[name] = pkgObj.location;
							}

							//Save pointer to main module ID for pkg name.
							//Remove leading dot in main, so main paths are normalized,
							//and remove any trailing .js, since different package
							//envs have different conventions: some use a module name,
							//some use a file name.
							config.pkgs[name] = pkgObj.name + '/' + (pkgObj.main || 'main')
										 .replace(currDirRegExp, '')
										 .replace(jsSuffixRegExp, '');
						});
					}

					//If there are any "waiting to execute" modules in the registry,
					//update the maps for them, since their info, like URLs to load,
					//may have changed.
					eachProp(registry, function (mod, id) {
						//If module already has init called, since it is too
						//late to modify them, and ignore unnormalized ones
						//since they are transient.
						if (!mod.inited && !mod.map.unnormalized) {
							mod.map = makeModuleMap(id, null, true);
						}
					});

					//If a deps array or a config callback is specified, then call
					//require with those args. This is useful when require is defined as a
					//config object before require.js is loaded.
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
								//Invalid call
								return onError(makeError('requireargs', 'Invalid require call'), errback);
							}

							//If require|exports|module are requested, get the
							//value for them from the special handlers. Caveat:
							//this only works while module is being defined.
							if (relMap && hasProp(handlers, deps)) {
								return handlers[deps](registry[relMap.id]);
							}

							//Synchronous access to one module. If require.get is
							//available (as in the Node adapter), prefer that.
							if (req.get) {
								return req.get(context, deps, relMap, localRequire);
							}

							//Normalize module name, if it contains . or ..
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

						//Grab defines waiting in the global queue.
						intakeDefines();

						//Mark all the dependencies as needing to be loaded.
						context.nextTick(function () {
							//Some defines could have been added since the
							//require call, collect them.
							intakeDefines();

							requireMod = getModule(makeModuleMap(null, relMap));

							//Store if map config should be applied to this require
							//call for dependencies.
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

						/**
						 * Converts a module name + .extension into an URL path.
						 * *Requires* the use of a module name. It does not support using
						 * plain URLs like nameToUrl.
						 */
						toUrl: function (moduleNamePlusExt) {
							var ext,
								index = moduleNamePlusExt.lastIndexOf('.'),
								segment = moduleNamePlusExt.split('/')[0],
								isRelative = segment === '.' || segment === '..';

							//Have a file extension alias, and it is not the
							//dots from a relative path.
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

					//Only allow undef on top level require calls
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

							//Clean queued defines too. Go backwards
							//in array so that the splices do not
							//mess up the iteration.
							eachReverse(defQueue, function(args, i) {
								if (args[0] === id) {
									defQueue.splice(i, 1);
								}
							});
							delete context.defQueueMap[id];

							if (mod) {
								//Hold on to listeners in case the
								//module will be attempted to be reloaded
								//using a different config.
								if (mod.events.defined) {
									undefEvents[id] = mod.events;
								}

								cleanRegistry(id);
							}
						};
					}

					return localRequire;
				},

				/**
				 * Called to enable a module if it is still in the registry
				 * awaiting enablement. A second arg, parent, the parent module,
				 * is passed in for context, when this method is overridden by
				 * the optimizer. Not shown here to keep code compact.
				 */
				enable: function (depMap) {
					var mod = getOwn(registry, depMap.id);
					if (mod) {
						getModule(depMap).enable();
					}
				},

				/**
				 * Internal method used by environment adapters to complete a load event.
				 * A load event could be a script load or just a load pass from a synchronous
				 * load call.
				 * @param {String} moduleName the name of the module to potentially complete.
				 */
				completeLoad: function (moduleName) {
					var found, args, mod,
						shim = getOwn(config.shim, moduleName) || {},
						shExports = shim.exports;

					takeGlobalQueue();

					while (defQueue.length) {
						args = defQueue.shift();
						if (args[0] === null) {
							args[0] = moduleName;
							//If already found an anonymous module and bound it
							//to this name, then this is some other anon module
							//waiting for its completeLoad to fire.
							if (found) {
								break;
							}
							found = true;
						} else if (args[0] === moduleName) {
							//Found matching define call for this script!
							found = true;
						}

						callGetModule(args);
					}
					context.defQueueMap = {};

					//Do this after the cycle of callGetModule in case the result
					//of those calls/init calls changes the registry.
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
							//A script that does not call define(), so just simulate
							//the call for it.
							callGetModule([moduleName, (shim.deps || []), shim.exportsFn]);
						}
					}

					checkLoaded();
				},

				/**
				 * Converts a module name to a file path. Supports cases where
				 * moduleName may actually be just an URL.
				 * Note that it **does not** call normalize on the moduleName,
				 * it is assumed to have already been normalized. This is an
				 * internal API, not a public one. Use toUrl for the public API.
				 */
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

					//If a colon is in the URL, it indicates a protocol is used and it is just
					//an URL to a file, or if it starts with a slash, contains a query arg (i.e. ?)
					//or ends with .js, then assume the user meant to use an url and not a module id.
					//The slash is important for protocol-less URLs as well as full paths.
					if (req.jsExtRegExp.test(moduleName)) {
						//Just a plain path, not module name lookup, so just return it.
						//Add extension if it is included. This is a bit wonky, only non-.js things pass
						//an extension, this method probably needs to be reworked.
						url = moduleName + (ext || '');
					} else {
						//A module that needs to be converted to a path.
						paths = config.paths;

						syms = moduleName.split('/');
						//For each module name segment, see if there is a path
						//registered for it. Start with most specific name
						//and work up from it.
						for (i = syms.length; i > 0; i -= 1) {
							parentModule = syms.slice(0, i).join('/');

							parentPath = getOwn(paths, parentModule);
							if (parentPath) {
								//If an array, it means there are a few choices,
								//Choose the one that is desired
								if (isArray(parentPath)) {
									parentPath = parentPath[0];
								}
								syms.splice(0, i, parentPath);
								break;
							}
						}

						//Join the path parts together, then figure out if baseUrl is needed.
						url = syms.join('/');
						url += (ext || (/^data\\:|^blob\\:|\\?/.test(url) || skipExt ? '' : '.js'));
						url = (url.charAt(0) === '/' || url.match(/^[\\w\\+\\.\\-]+:/) ? '' : config.baseUrl) + url;
					}

					return config.urlArgs && !/^blob\\:/.test(url) ?
						   url + config.urlArgs(moduleName, url) : url;
				},

				//Delegates to req.load. Broken out as a separate function to
				//allow overriding in the optimizer.
				load: function (id, url) {
					req.load(context, id, url);
				},

				/**
				 * Executes a module callback function. Broken out as a separate function
				 * solely to allow the build system to sequence the files in the built
				 * layer in the right sequence.
				 *
				 * @private
				 */
				execCb: function (name, callback, args, exports) {
					return callback.apply(exports, args);
				},

				/**
				 * callback for script loads, used to check status of loading.
				 *
				 * @param {Event} evt the event from the browser for the script
				 * that was loaded.
				 */
				onScriptLoad: function (evt) {
					//Using currentTarget instead of target for Firefox 2.0's sake. Not
					//all old browsers will be supported, but this one was easy enough
					//to support and still makes sense.
					if (evt.type === 'load' ||
							(readyRegExp.test((evt.currentTarget || evt.srcElement).readyState))) {
						//Reset interactive script so a script node is not held onto for
						//to long.
						interactiveScript = null;

						//Pull out the name of the module and the context.
						var data = getScriptData(evt);
						context.completeLoad(data.id);
					}
				},

				/**
				 * Callback for script errors.
				 */
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

		/**
		 * Main entry point.
		 *
		 * If the only argument to require is a string, then the module that
		 * is represented by that string is fetched for the appropriate context.
		 *
		 * If the first argument is an array, then it will be treated as an array
		 * of dependency string names to fetch. An optional function callback can
		 * be specified to execute when all of those dependencies are available.
		 *
		 * Make a local req variable to help Caja compliance (it assumes things
		 * on a require that are not standardized), and to give a short
		 * name for minification/local scope use.
		 */
		req = window.requirejs = function (deps, callback, errback, optional) {

			//Find the right context, use default
			var context, config,
				contextName = defContextName;

			// Determine if have config object in the call.
			if (!isArray(deps) && typeof deps !== 'string') {
				// deps is a config object
				config = deps;
				if (isArray(callback)) {
					// Adjust args if there are dependencies
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

		/**
		 * Support require.config() to make it easier to cooperate with other
		 * AMD loaders on globally agreed names.
		 */
		req.config = function (config) {
			return req(config);
		};

		/**
		 * Execute something after the current tick
		 * of the event loop. Override for other envs
		 * that have a better solution than setTimeout.
		 * @param  {Function} fn function to execute later.
		 */
		req.nextTick = typeof setTimeout !== 'undefined' ? function (fn) {
			setTimeout(fn, 4);
		} : function (fn) { fn(); };

		/**
		 * Export require as a global, but only if it does not already exist.
		 */
		if (!window.require) {
			window.require = req;
		}

		req.version = version;

		//Used to filter out dependencies that are already paths.
		req.jsExtRegExp = /^\\/|:|\\?|\\.js$/;
		req.isBrowser = isBrowser;
		s = req.s = {
			contexts: contexts,
			newContext: newContext
		};

		//Create default context.
		req({});

		//Exports some context-sensitive methods on global require.
		each([
			'toUrl',
			'undef',
			'defined',
			'specified'
		], function (prop) {
			//Reference from contexts instead of early binding to default context,
			//so that during builds, the latest instance of the default context
			//with its config gets used.
			req[prop] = function () {
				var ctx = contexts[defContextName];
				return ctx.require[prop].apply(ctx, arguments);
			};
		});

		if (isBrowser) {
			head = s.head = document.getElementsByTagName('head')[0];
			//If BASE tag is in play, using appendChild is a problem for IE6.
			//When that browser dies, this can be removed. Details in this jQuery bug:
			//http://dev.jquery.com/ticket/2709
			baseElement = document.getElementsByTagName('base')[0];
			if (baseElement) {
				head = s.head = baseElement.parentNode;
			}
		}

		/**
		 * Any errors that require explicitly generates will be passed to this
		 * function. Intercept/override it if you want custom error handling.
		 * @param {Error} err the error object.
		 */
		req.onError = defaultOnError;

		/**
		 * Creates the node for the load command. Only used in browser envs.
		 */
		req.createNode = function (config, moduleName, url) {
			var node = config.xhtml ?
					document.createElementNS('http://www.w3.org/1999/xhtml', 'html:script') :
					document.createElement('script');
			node.type = config.scriptType || 'text/javascript';
			node.charset = 'utf-8';
			node.async = true;
			return node;
		};

		/**
		 * Does the request to load a module for the browser case.
		 * Make this a separate function to allow other environments
		 * to override it.
		 *
		 * @param {Object} context the require context to find state.
		 * @param {String} moduleName the name of the module.
		 * @param {Object} url the URL to the module.
		 */
		req.load = function (context, moduleName, url) {
			var config = (context && context.config) || {},
				node;
			if (isBrowser) {
				//In the browser so use a script tag
				node = req.createNode(config, moduleName, url);

				node.setAttribute('data-requirecontext', context.contextName);
				node.setAttribute('data-requiremodule', moduleName);

				//Set up load listener. Test attachEvent first because IE9 has
				//a subtle issue in its addEventListener and script onload firings
				//that do not match the behavior of all other browsers with
				//addEventListener support, which fire the onload event for a
				//script right after the script execution. See:
				//https://connect.microsoft.com/IE/feedback/details/648057/script-onload-event-is-not-fired-immediately-after-script-execution
				//UNFORTUNATELY Opera implements attachEvent but does not follow the script
				//script execution mode.
				if (node.attachEvent &&
						//Check if node.attachEvent is artificially added by custom script or
						//natively supported by browser
						//read https://github.com/requirejs/requirejs/issues/187
						//if we can NOT find [native code] then it must NOT natively supported.
						//in IE8, node.attachEvent does not have toString()
						//Note the test for "[native code" with no closing brace, see:
						//https://github.com/requirejs/requirejs/issues/273
						!(node.attachEvent.toString && node.attachEvent.toString().indexOf('[native code') < 0) &&
						!isOpera) {
					//Probably IE. IE (at least 6-8) do not fire
					//script onload right after executing the script, so
					//we cannot tie the anonymous define call to a name.
					//However, IE reports the script as being in 'interactive'
					//readyState at the time of the define call.
					useInteractive = true;

					node.attachEvent('onreadystatechange', context.onScriptLoad);
					//It would be great to add an error handler here to catch
					//404s in IE9+. However, onreadystatechange will fire before
					//the error handler, so that does not help. If addEventListener
					//is used, then IE will fire error before load, but we cannot
					//use that pathway given the connect.microsoft.com issue
					//mentioned above about not doing the 'script execute,
					//then fire the script load event listener before execute
					//next script' that other browsers do.
					//Best hope: IE10 fixes the issues,
					//and then destroys all installs of IE 6-9.
					//node.attachEvent('onerror', context.onScriptError);
				} else {
					node.addEventListener('load', context.onScriptLoad, false);
					node.addEventListener('error', context.onScriptError, false);
				}
				node.src = url;

				//Calling onNodeCreated after all properties on the node have been
				//set, but before it is placed in the DOM.
				if (config.onNodeCreated) {
					config.onNodeCreated(node, config, moduleName, url);
				}

				//For some cache cases in IE 6-8, the script executes before the end
				//of the appendChild execution, so to tie an anonymous define
				//call to the module name (which is stored on the node), hold on
				//to a reference to this node, but clear after the DOM insertion.
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
					//In a web worker, use importScripts. This is not a very
					//efficient use of importScripts, importScripts will block until
					//its script is downloaded and evaluated. However, if web workers
					//are in play, the expectation is that a build has been done so
					//that only one script needs to be loaded anyway. This may need
					//to be reevaluated if other use cases become common.

					// Post a task to the event loop to work around a bug in WebKit
					// where the worker gets garbage-collected after calling
					// importScripts(): https://webkit.org/b/153317
					setTimeout(function() {}, 0);
					importScripts(url);

					//Account for anonymous modules
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

		//Look for a data-main script attribute, which could also adjust the baseUrl.
		if (isBrowser && !cfg.skipDataMain) {
			//Figure out baseUrl. Get it from the script tag with require.js in it.
			eachReverse(scripts(), function (script) {
				//Set the 'head' where we can append children by
				//using the script's parent.
				if (!head) {
					head = script.parentNode;
				}

				//Look for a data-main attribute to set main script for the page
				//to load. If it is there, the path to data main becomes the
				//baseUrl, if it is not already set.
				dataMain = script.getAttribute('data-main');
				if (dataMain) {
					//Preserve dataMain in case it is a path (i.e. contains '?')
					mainScript = dataMain;

					//Set final baseUrl if there is not already an explicit one,
					//but only do so if the data-main value is not a loader plugin
					//module ID.
					if (!cfg.baseUrl && mainScript.indexOf('!') === -1) {
						//Pull off the directory of data-main for use as the
						//baseUrl.
						src = mainScript.split('/');
						mainScript = src.pop();
						subPath = src.length ? src.join('/')  + '/' : './';

						cfg.baseUrl = subPath;
					}

					//Strip off any trailing .js since mainScript is now
					//like a module name.
					mainScript = mainScript.replace(jsSuffixRegExp, '');

					//If mainScript is still a path, fall back to dataMain
					if (req.jsExtRegExp.test(mainScript)) {
						mainScript = dataMain;
					}

					//Put the data-main script in the files to load.
					cfg.deps = cfg.deps ? cfg.deps.concat(mainScript) : [mainScript];

					return true;
				}
			});
		}

		/**
		 * The function that handles definitions of modules. Differs from
		 * require() in that a string for the module should be the first argument,
		 * and the function to execute after dependencies are loaded should
		 * return a value to define the module corresponding to the first argument's
		 * name.
		 */
		window.define = function (name, deps, callback) {
			var node, context;

			//Allow for anonymous modules
			if (typeof name !== 'string') {
				//Adjust args appropriately
				callback = deps;
				deps = name;
				name = null;
			}

			//This module may not have dependencies
			if (!isArray(deps)) {
				callback = deps;
				deps = null;
			}

			//If no name, and callback is a function, then figure out if it a
			//CommonJS thing with dependencies.
			if (!deps && isFunction(callback)) {
				deps = [];
				//Remove comments from the callback string,
				//look for require calls, and pull them into the dependencies,
				//but only if there are function args.
				if (callback.length) {
					callback
						.toString()
						.replace(commentRegExp, commentReplace)
						.replace(cjsRequireRegExp, function (match, dep) {
							deps.push(dep);
						});

					//May be a CommonJS thing even without require calls, but still
					//could use exports, and module. Avoid doing exports and module
					//work though if it just needs require.
					//REQUIRES the function to expect the CommonJS variables in the
					//order listed below.
					deps = (callback.length === 1 ? ['require'] : ['require', 'exports', 'module']).concat(deps);
				}
			}

			//If in IE 6-8 and hit an anonymous define() call, do the interactive
			//work.
			if (useInteractive) {
				node = currentlyAddingScript || getInteractiveScript();
				if (node) {
					if (!name) {
						name = node.getAttribute('data-requiremodule');
					}
					context = contexts[node.getAttribute('data-requirecontext')];
				}
			}

			//Always save off evaluating the def call until the script onload handler.
			//This allows multiple modules to be in a file without prematurely
			//tracing dependencies, and allows for anonymous module support,
			//where the module name is not known until the script onload event
			//occurs. If no context, use the global queue, and get it processed
			//in the onscript load callback.
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

		/**
		 * Executes the text. Normally just uses eval, but can be modified
		 * to use a better, environment-specific call. Only used for transpiling
		 * loader plugins, not for plain JS modules.
		 * @param {String} text the text to execute/evaluate.
		 */
		req.exec = function (text) {
			/*jslint evil: true */
			return eval(text);
		};

		//Set up with config info.
		req(cfg);
	}(this, (typeof setTimeout === 'undefined' ? undefined : setTimeout)));
   `);
    runtime.push('\n////\n');
    runtime.push(createImportMap(model, path, model.flags.remapImportSource));
    runtime.push('\n');
    runtime.push('requirejs.config({path:importData})');
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
    return `const importData = {${result.join(',')}}`;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJ1bnRpbWUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJydW50aW1lLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcGF0aF8xID0gcmVxdWlyZShcInBhdGhcIik7XG5mdW5jdGlvbiBydW50aW1lKGFyZ3MpIHtcbiAgICByZXR1cm4gYXN5bmMgKG1vZGVsLCBjb250ZXh0KSA9PiB7XG4gICAgICAgIHZhciBfYTtcbiAgICAgICAgbGV0IHBhdGggPSBwYXRoXzEuam9pbihtb2RlbC5wcm9qZWN0LnBhdGgsIGFyZ3Mub3V0KTtcbiAgICAgICAgbGV0IGhhbmRsZUV4aXN0aW5nID0gKF9hID0gYXJncy5oYW5kbGVFeGlzdGluZywgKF9hICE9PSBudWxsICYmIF9hICE9PSB2b2lkIDAgPyBfYSA6ICdyZXBsYWNlJykpO1xuICAgICAgICBsZXQgcnVudGltZSA9IGdlbmVyYXRlUnVudGltZShhcmdzLCBtb2RlbCwgcGF0aCk7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJ1bnRpbWUuam9pbignJyk7XG4gICAgICAgIGlmIChhd2FpdCBtb2RlbC5maWxlU3lzdGVtLmV4aXN0cyhwYXRoKSkge1xuICAgICAgICAgICAgbGV0IGV4aXN0aW5nO1xuICAgICAgICAgICAgc3dpdGNoIChoYW5kbGVFeGlzdGluZykge1xuICAgICAgICAgICAgICAgIGNhc2UgJ2FwcGVuZCc6XG4gICAgICAgICAgICAgICAgICAgIGV4aXN0aW5nID0gYXdhaXQgbW9kZWwuZmlsZVN5c3RlbS5yZWFkRmlsZShwYXRoLCAndXRmOCcpO1xuICAgICAgICAgICAgICAgICAgICBhd2FpdCBtb2RlbC5maWxlU3lzdGVtLndyaXRlRmlsZShwYXRoLCBgJHtleGlzdGluZ31cXG4ke3Jlc3VsdH1gKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAncmVwbGFjZSc6XG4gICAgICAgICAgICAgICAgICAgIGF3YWl0IG1vZGVsLmZpbGVTeXN0ZW0ud3JpdGVGaWxlKHBhdGgsIHJlc3VsdCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgIGNhc2UgJ3ByZXBlbmQnOlxuICAgICAgICAgICAgICAgICAgICBleGlzdGluZyA9IGF3YWl0IG1vZGVsLmZpbGVTeXN0ZW0ucmVhZEZpbGUocGF0aCwgJ3V0ZjgnKTtcbiAgICAgICAgICAgICAgICAgICAgYXdhaXQgbW9kZWwuZmlsZVN5c3RlbS53cml0ZUZpbGUocGF0aCwgYCR7cmVzdWx0fVxcbiR7ZXhpc3Rpbmd9YCk7XG4gICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgYXdhaXQgbW9kZWwuZmlsZVN5c3RlbS53cml0ZUZpbGUocGF0aCwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgfTtcbn1cbmV4cG9ydHMucnVudGltZSA9IHJ1bnRpbWU7XG5mdW5jdGlvbiBnZW5lcmF0ZVJ1bnRpbWUoYXJncywgbW9kZWwsIHBhdGgpIHtcbiAgICB2YXIgX2E7XG4gICAgbGV0IHJ1bnRpbWUgPSBbKF9hID0gYXJncy5oZWFkZXIsIChfYSAhPT0gbnVsbCAmJiBfYSAhPT0gdm9pZCAwID8gX2EgOiAnJykpXTtcbiAgICBpZiAobW9kZWwucHJvamVjdC5yZXNvbHZlZENvbmZpZy5wbGF0Zm9ybSA9PT0gJ2Jyb3dzZXInKSB7XG4gICAgICAgIGdlbmVyYXRlQnJvd3NlclJ1bnRpbWUobW9kZWwsIHJ1bnRpbWUsIHBhdGgpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgZ2VuZXJhdGVOb2RlSnNSdW50aW1lKG1vZGVsLCBydW50aW1lLCBwYXRoKTtcbiAgICB9XG4gICAgaWYgKGFyZ3MuZm9vdGVyKSB7XG4gICAgICAgIHJ1bnRpbWUucHVzaChhcmdzLmZvb3Rlcik7XG4gICAgfVxuICAgIHJldHVybiBydW50aW1lO1xufVxuZnVuY3Rpb24gZ2VuZXJhdGVCcm93c2VyUnVudGltZShtb2RlbCwgcnVudGltZSwgcGF0aCkge1xuICAgIHJ1bnRpbWUucHVzaChgXG5cdChmdW5jdGlvbiAoZ2xvYmFsLCBzZXRUaW1lb3V0KSB7XG5cdFx0dmFyIHJlcSwgcywgaGVhZCwgYmFzZUVsZW1lbnQsIGRhdGFNYWluLCBzcmMsXG5cdFx0XHRpbnRlcmFjdGl2ZVNjcmlwdCwgY3VycmVudGx5QWRkaW5nU2NyaXB0LCBtYWluU2NyaXB0LCBzdWJQYXRoLFxuXHRcdFx0dmVyc2lvbiA9ICcyLjMuNicsXG5cdFx0XHRjb21tZW50UmVnRXhwID0gL1xcXFwvXFxcXCpbXFxcXHNcXFxcU10qP1xcXFwqXFxcXC98KFteOlwiJz1dfF4pXFxcXC9cXFxcLy4qJC9tZyxcblx0XHRcdGNqc1JlcXVpcmVSZWdFeHAgPSAvW14uXVxcXFxzKnJlcXVpcmVcXFxccypcXFxcKFxcXFxzKltcIiddKFteJ1wiXFxcXHNdKylbXCInXVxcXFxzKlxcXFwpL2csXG5cdFx0XHRqc1N1ZmZpeFJlZ0V4cCA9IC9cXFxcLmpzJC8sXG5cdFx0XHRjdXJyRGlyUmVnRXhwID0gL15cXFxcLlxcXFwvLyxcblx0XHRcdG9wID0gT2JqZWN0LnByb3RvdHlwZSxcblx0XHRcdG9zdHJpbmcgPSBvcC50b1N0cmluZyxcblx0XHRcdGhhc093biA9IG9wLmhhc093blByb3BlcnR5LFxuXHRcdFx0aXNCcm93c2VyID0gISEodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgdHlwZW9mIG5hdmlnYXRvciAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LmRvY3VtZW50KSxcblx0XHRcdGlzV2ViV29ya2VyID0gIWlzQnJvd3NlciAmJiB0eXBlb2YgaW1wb3J0U2NyaXB0cyAhPT0gJ3VuZGVmaW5lZCcsXG5cdFx0XHQvL1BTMyBpbmRpY2F0ZXMgbG9hZGVkIGFuZCBjb21wbGV0ZSwgYnV0IG5lZWQgdG8gd2FpdCBmb3IgY29tcGxldGVcblx0XHRcdC8vc3BlY2lmaWNhbGx5LiBTZXF1ZW5jZSBpcyAnbG9hZGluZycsICdsb2FkZWQnLCBleGVjdXRpb24sXG5cdFx0XHQvLyB0aGVuICdjb21wbGV0ZScuIFRoZSBVQSBjaGVjayBpcyB1bmZvcnR1bmF0ZSwgYnV0IG5vdCBzdXJlIGhvd1xuXHRcdFx0Ly90byBmZWF0dXJlIHRlc3Qgdy9vIGNhdXNpbmcgcGVyZiBpc3N1ZXMuXG5cdFx0XHRyZWFkeVJlZ0V4cCA9IGlzQnJvd3NlciAmJiBuYXZpZ2F0b3IucGxhdGZvcm0gPT09ICdQTEFZU1RBVElPTiAzJyA/XG5cdFx0XHRcdFx0XHQgIC9eY29tcGxldGUkLyA6IC9eKGNvbXBsZXRlfGxvYWRlZCkkLyxcblx0XHRcdGRlZkNvbnRleHROYW1lID0gJ18nLFxuXHRcdFx0Ly9PaCB0aGUgdHJhZ2VkeSwgZGV0ZWN0aW5nIG9wZXJhLiBTZWUgdGhlIHVzYWdlIG9mIGlzT3BlcmEgZm9yIHJlYXNvbi5cblx0XHRcdGlzT3BlcmEgPSB0eXBlb2Ygb3BlcmEgIT09ICd1bmRlZmluZWQnICYmIG9wZXJhLnRvU3RyaW5nKCkgPT09ICdbb2JqZWN0IE9wZXJhXScsXG5cdFx0XHRjb250ZXh0cyA9IHt9LFxuXHRcdFx0Y2ZnID0ge30sXG5cdFx0XHRnbG9iYWxEZWZRdWV1ZSA9IFtdLFxuXHRcdFx0dXNlSW50ZXJhY3RpdmUgPSBmYWxzZTtcblxuXHRcdC8vQ291bGQgbWF0Y2ggc29tZXRoaW5nIGxpa2UgJykvL2NvbW1lbnQnLCBkbyBub3QgbG9zZSB0aGUgcHJlZml4IHRvIGNvbW1lbnQuXG5cdFx0ZnVuY3Rpb24gY29tbWVudFJlcGxhY2UobWF0Y2gsIHNpbmdsZVByZWZpeCkge1xuXHRcdFx0cmV0dXJuIHNpbmdsZVByZWZpeCB8fCAnJztcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBpc0Z1bmN0aW9uKGl0KSB7XG5cdFx0XHRyZXR1cm4gb3N0cmluZy5jYWxsKGl0KSA9PT0gJ1tvYmplY3QgRnVuY3Rpb25dJztcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBpc0FycmF5KGl0KSB7XG5cdFx0XHRyZXR1cm4gb3N0cmluZy5jYWxsKGl0KSA9PT0gJ1tvYmplY3QgQXJyYXldJztcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIGl0ZXJhdGluZyBvdmVyIGFuIGFycmF5LiBJZiB0aGUgZnVuYyByZXR1cm5zXG5cdFx0ICogYSB0cnVlIHZhbHVlLCBpdCB3aWxsIGJyZWFrIG91dCBvZiB0aGUgbG9vcC5cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBlYWNoKGFyeSwgZnVuYykge1xuXHRcdFx0aWYgKGFyeSkge1xuXHRcdFx0XHR2YXIgaTtcblx0XHRcdFx0Zm9yIChpID0gMDsgaSA8IGFyeS5sZW5ndGg7IGkgKz0gMSkge1xuXHRcdFx0XHRcdGlmIChhcnlbaV0gJiYgZnVuYyhhcnlbaV0sIGksIGFyeSkpIHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEhlbHBlciBmdW5jdGlvbiBmb3IgaXRlcmF0aW5nIG92ZXIgYW4gYXJyYXkgYmFja3dhcmRzLiBJZiB0aGUgZnVuY1xuXHRcdCAqIHJldHVybnMgYSB0cnVlIHZhbHVlLCBpdCB3aWxsIGJyZWFrIG91dCBvZiB0aGUgbG9vcC5cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBlYWNoUmV2ZXJzZShhcnksIGZ1bmMpIHtcblx0XHRcdGlmIChhcnkpIHtcblx0XHRcdFx0dmFyIGk7XG5cdFx0XHRcdGZvciAoaSA9IGFyeS5sZW5ndGggLSAxOyBpID4gLTE7IGkgLT0gMSkge1xuXHRcdFx0XHRcdGlmIChhcnlbaV0gJiYgZnVuYyhhcnlbaV0sIGksIGFyeSkpIHtcblx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGhhc1Byb3Aob2JqLCBwcm9wKSB7XG5cdFx0XHRyZXR1cm4gaGFzT3duLmNhbGwob2JqLCBwcm9wKTtcblx0XHR9XG5cblx0XHRmdW5jdGlvbiBnZXRPd24ob2JqLCBwcm9wKSB7XG5cdFx0XHRyZXR1cm4gaGFzUHJvcChvYmosIHByb3ApICYmIG9ialtwcm9wXTtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBDeWNsZXMgb3ZlciBwcm9wZXJ0aWVzIGluIGFuIG9iamVjdCBhbmQgY2FsbHMgYSBmdW5jdGlvbiBmb3IgZWFjaFxuXHRcdCAqIHByb3BlcnR5IHZhbHVlLiBJZiB0aGUgZnVuY3Rpb24gcmV0dXJucyBhIHRydXRoeSB2YWx1ZSwgdGhlbiB0aGVcblx0XHQgKiBpdGVyYXRpb24gaXMgc3RvcHBlZC5cblx0XHQgKi9cblx0XHRmdW5jdGlvbiBlYWNoUHJvcChvYmosIGZ1bmMpIHtcblx0XHRcdHZhciBwcm9wO1xuXHRcdFx0Zm9yIChwcm9wIGluIG9iaikge1xuXHRcdFx0XHRpZiAoaGFzUHJvcChvYmosIHByb3ApKSB7XG5cdFx0XHRcdFx0aWYgKGZ1bmMob2JqW3Byb3BdLCBwcm9wKSkge1xuXHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogU2ltcGxlIGZ1bmN0aW9uIHRvIG1peCBpbiBwcm9wZXJ0aWVzIGZyb20gc291cmNlIGludG8gdGFyZ2V0LFxuXHRcdCAqIGJ1dCBvbmx5IGlmIHRhcmdldCBkb2VzIG5vdCBhbHJlYWR5IGhhdmUgYSBwcm9wZXJ0eSBvZiB0aGUgc2FtZSBuYW1lLlxuXHRcdCAqL1xuXHRcdGZ1bmN0aW9uIG1peGluKHRhcmdldCwgc291cmNlLCBmb3JjZSwgZGVlcFN0cmluZ01peGluKSB7XG5cdFx0XHRpZiAoc291cmNlKSB7XG5cdFx0XHRcdGVhY2hQcm9wKHNvdXJjZSwgZnVuY3Rpb24gKHZhbHVlLCBwcm9wKSB7XG5cdFx0XHRcdFx0aWYgKGZvcmNlIHx8ICFoYXNQcm9wKHRhcmdldCwgcHJvcCkpIHtcblx0XHRcdFx0XHRcdGlmIChkZWVwU3RyaW5nTWl4aW4gJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJlxuXHRcdFx0XHRcdFx0XHQhaXNBcnJheSh2YWx1ZSkgJiYgIWlzRnVuY3Rpb24odmFsdWUpICYmXG5cdFx0XHRcdFx0XHRcdCEodmFsdWUgaW5zdGFuY2VvZiBSZWdFeHApKSB7XG5cblx0XHRcdFx0XHRcdFx0aWYgKCF0YXJnZXRbcHJvcF0pIHtcblx0XHRcdFx0XHRcdFx0XHR0YXJnZXRbcHJvcF0gPSB7fTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRtaXhpbih0YXJnZXRbcHJvcF0sIHZhbHVlLCBmb3JjZSwgZGVlcFN0cmluZ01peGluKTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdHRhcmdldFtwcm9wXSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cdFx0XHR9XG5cdFx0XHRyZXR1cm4gdGFyZ2V0O1xuXHRcdH1cblxuXHRcdC8vU2ltaWxhciB0byBGdW5jdGlvbi5wcm90b3R5cGUuYmluZCwgYnV0IHRoZSAndGhpcycgb2JqZWN0IGlzIHNwZWNpZmllZFxuXHRcdC8vZmlyc3QsIHNpbmNlIGl0IGlzIGVhc2llciB0byByZWFkL2ZpZ3VyZSBvdXQgd2hhdCAndGhpcycgd2lsbCBiZS5cblx0XHRmdW5jdGlvbiBiaW5kKG9iaiwgZm4pIHtcblx0XHRcdHJldHVybiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdHJldHVybiBmbi5hcHBseShvYmosIGFyZ3VtZW50cyk7XG5cdFx0XHR9O1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHNjcmlwdHMoKSB7XG5cdFx0XHRyZXR1cm4gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoJ3NjcmlwdCcpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIGRlZmF1bHRPbkVycm9yKGVycikge1xuXHRcdFx0dGhyb3cgZXJyO1xuXHRcdH1cblxuXHRcdC8vQWxsb3cgZ2V0dGluZyBhIGdsb2JhbCB0aGF0IGlzIGV4cHJlc3NlZCBpblxuXHRcdC8vZG90IG5vdGF0aW9uLCBsaWtlICdhLmIuYycuXG5cdFx0ZnVuY3Rpb24gZ2V0R2xvYmFsKHZhbHVlKSB7XG5cdFx0XHRpZiAoIXZhbHVlKSB7XG5cdFx0XHRcdHJldHVybiB2YWx1ZTtcblx0XHRcdH1cblx0XHRcdHZhciBnID0gZ2xvYmFsO1xuXHRcdFx0ZWFjaCh2YWx1ZS5zcGxpdCgnLicpLCBmdW5jdGlvbiAocGFydCkge1xuXHRcdFx0XHRnID0gZ1twYXJ0XTtcblx0XHRcdH0pO1xuXHRcdFx0cmV0dXJuIGc7XG5cdFx0fVxuXG5cdFx0LyoqXG5cdFx0ICogQ29uc3RydWN0cyBhbiBlcnJvciB3aXRoIGEgcG9pbnRlciB0byBhbiBVUkwgd2l0aCBtb3JlIGluZm9ybWF0aW9uLlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBpZCB0aGUgZXJyb3IgSUQgdGhhdCBtYXBzIHRvIGFuIElEIG9uIGEgd2ViIHBhZ2UuXG5cdFx0ICogQHBhcmFtIHtTdHJpbmd9IG1lc3NhZ2UgaHVtYW4gcmVhZGFibGUgZXJyb3IuXG5cdFx0ICogQHBhcmFtIHtFcnJvcn0gW2Vycl0gdGhlIG9yaWdpbmFsIGVycm9yLCBpZiB0aGVyZSBpcyBvbmUuXG5cdFx0ICpcblx0XHQgKiBAcmV0dXJucyB7RXJyb3J9XG5cdFx0ICovXG5cdFx0ZnVuY3Rpb24gbWFrZUVycm9yKGlkLCBtc2csIGVyciwgcmVxdWlyZU1vZHVsZXMpIHtcblx0XHRcdHZhciBlID0gbmV3IEVycm9yKG1zZyArICdcXFxcbmh0dHBzOi8vcmVxdWlyZWpzLm9yZy9kb2NzL2Vycm9ycy5odG1sIycgKyBpZCk7XG5cdFx0XHRlLnJlcXVpcmVUeXBlID0gaWQ7XG5cdFx0XHRlLnJlcXVpcmVNb2R1bGVzID0gcmVxdWlyZU1vZHVsZXM7XG5cdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdGUub3JpZ2luYWxFcnJvciA9IGVycjtcblx0XHRcdH1cblx0XHRcdHJldHVybiBlO1xuXHRcdH1cblxuXHRcdGlmICh0eXBlb2YgZGVmaW5lICE9PSAndW5kZWZpbmVkJykge1xuXHRcdFx0Ly9JZiBhIGRlZmluZSBpcyBhbHJlYWR5IGluIHBsYXkgdmlhIGFub3RoZXIgQU1EIGxvYWRlcixcblx0XHRcdC8vZG8gbm90IG92ZXJ3cml0ZS5cblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHQvL0FsbG93IGZvciBhIHJlcXVpcmUgY29uZmlnIG9iamVjdFxuXHRcdGlmICh0eXBlb2YgcmVxdWlyZSAhPT0gJ3VuZGVmaW5lZCcgJiYgIWlzRnVuY3Rpb24ocmVxdWlyZSkpIHtcblx0XHRcdC8vYXNzdW1lIGl0IGlzIGEgY29uZmlnIG9iamVjdC5cblx0XHRcdGNmZyA9IHJlcXVpcmU7XG5cdFx0XHRyZXF1aXJlID0gdW5kZWZpbmVkO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIG5ld0NvbnRleHQoY29udGV4dE5hbWUpIHtcblx0XHRcdHZhciBpbkNoZWNrTG9hZGVkLCBNb2R1bGUsIGNvbnRleHQsIGhhbmRsZXJzLFxuXHRcdFx0XHRjaGVja0xvYWRlZFRpbWVvdXRJZCxcblx0XHRcdFx0Y29uZmlnID0ge1xuXHRcdFx0XHRcdC8vRGVmYXVsdHMuIERvIG5vdCBzZXQgYSBkZWZhdWx0IGZvciBtYXBcblx0XHRcdFx0XHQvL2NvbmZpZyB0byBzcGVlZCB1cCBub3JtYWxpemUoKSwgd2hpY2hcblx0XHRcdFx0XHQvL3dpbGwgcnVuIGZhc3RlciBpZiB0aGVyZSBpcyBubyBkZWZhdWx0LlxuXHRcdFx0XHRcdHdhaXRTZWNvbmRzOiA3LFxuXHRcdFx0XHRcdGJhc2VVcmw6ICcuLycsXG5cdFx0XHRcdFx0cGF0aHM6IHt9LFxuXHRcdFx0XHRcdGJ1bmRsZXM6IHt9LFxuXHRcdFx0XHRcdHBrZ3M6IHt9LFxuXHRcdFx0XHRcdHNoaW06IHt9LFxuXHRcdFx0XHRcdGNvbmZpZzoge31cblx0XHRcdFx0fSxcblx0XHRcdFx0cmVnaXN0cnkgPSB7fSxcblx0XHRcdFx0Ly9yZWdpc3RyeSBvZiBqdXN0IGVuYWJsZWQgbW9kdWxlcywgdG8gc3BlZWRcblx0XHRcdFx0Ly9jeWNsZSBicmVha2luZyBjb2RlIHdoZW4gbG90cyBvZiBtb2R1bGVzXG5cdFx0XHRcdC8vYXJlIHJlZ2lzdGVyZWQsIGJ1dCBub3QgYWN0aXZhdGVkLlxuXHRcdFx0XHRlbmFibGVkUmVnaXN0cnkgPSB7fSxcblx0XHRcdFx0dW5kZWZFdmVudHMgPSB7fSxcblx0XHRcdFx0ZGVmUXVldWUgPSBbXSxcblx0XHRcdFx0ZGVmaW5lZCA9IHt9LFxuXHRcdFx0XHR1cmxGZXRjaGVkID0ge30sXG5cdFx0XHRcdGJ1bmRsZXNNYXAgPSB7fSxcblx0XHRcdFx0cmVxdWlyZUNvdW50ZXIgPSAxLFxuXHRcdFx0XHR1bm5vcm1hbGl6ZWRDb3VudGVyID0gMTtcblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBUcmltcyB0aGUgLiBhbmQgLi4gZnJvbSBhbiBhcnJheSBvZiBwYXRoIHNlZ21lbnRzLlxuXHRcdFx0ICogSXQgd2lsbCBrZWVwIGEgbGVhZGluZyBwYXRoIHNlZ21lbnQgaWYgYSAuLiB3aWxsIGJlY29tZVxuXHRcdFx0ICogdGhlIGZpcnN0IHBhdGggc2VnbWVudCwgdG8gaGVscCB3aXRoIG1vZHVsZSBuYW1lIGxvb2t1cHMsXG5cdFx0XHQgKiB3aGljaCBhY3QgbGlrZSBwYXRocywgYnV0IGNhbiBiZSByZW1hcHBlZC4gQnV0IHRoZSBlbmQgcmVzdWx0LFxuXHRcdFx0ICogYWxsIHBhdGhzIHRoYXQgdXNlIHRoaXMgZnVuY3Rpb24gc2hvdWxkIGxvb2sgbm9ybWFsaXplZC5cblx0XHRcdCAqIE5PVEU6IHRoaXMgbWV0aG9kIE1PRElGSUVTIHRoZSBpbnB1dCBhcnJheS5cblx0XHRcdCAqIEBwYXJhbSB7QXJyYXl9IGFyeSB0aGUgYXJyYXkgb2YgcGF0aCBzZWdtZW50cy5cblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gdHJpbURvdHMoYXJ5KSB7XG5cdFx0XHRcdHZhciBpLCBwYXJ0O1xuXHRcdFx0XHRmb3IgKGkgPSAwOyBpIDwgYXJ5Lmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdFx0cGFydCA9IGFyeVtpXTtcblx0XHRcdFx0XHRpZiAocGFydCA9PT0gJy4nKSB7XG5cdFx0XHRcdFx0XHRhcnkuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0aSAtPSAxO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAocGFydCA9PT0gJy4uJykge1xuXHRcdFx0XHRcdFx0Ly8gSWYgYXQgdGhlIHN0YXJ0LCBvciBwcmV2aW91cyB2YWx1ZSBpcyBzdGlsbCAuLixcblx0XHRcdFx0XHRcdC8vIGtlZXAgdGhlbSBzbyB0aGF0IHdoZW4gY29udmVydGVkIHRvIGEgcGF0aCBpdCBtYXlcblx0XHRcdFx0XHRcdC8vIHN0aWxsIHdvcmsgd2hlbiBjb252ZXJ0ZWQgdG8gYSBwYXRoLCBldmVuIHRob3VnaFxuXHRcdFx0XHRcdFx0Ly8gYXMgYW4gSUQgaXQgaXMgbGVzcyB0aGFuIGlkZWFsLiBJbiBsYXJnZXIgcG9pbnRcblx0XHRcdFx0XHRcdC8vIHJlbGVhc2VzLCBtYXkgYmUgYmV0dGVyIHRvIGp1c3Qga2ljayBvdXQgYW4gZXJyb3IuXG5cdFx0XHRcdFx0XHRpZiAoaSA9PT0gMCB8fCAoaSA9PT0gMSAmJiBhcnlbMl0gPT09ICcuLicpIHx8IGFyeVtpIC0gMV0gPT09ICcuLicpIHtcblx0XHRcdFx0XHRcdFx0Y29udGludWU7XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKGkgPiAwKSB7XG5cdFx0XHRcdFx0XHRcdGFyeS5zcGxpY2UoaSAtIDEsIDIpO1xuXHRcdFx0XHRcdFx0XHRpIC09IDI7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogR2l2ZW4gYSByZWxhdGl2ZSBtb2R1bGUgbmFtZSwgbGlrZSAuL3NvbWV0aGluZywgbm9ybWFsaXplIGl0IHRvXG5cdFx0XHQgKiBhIHJlYWwgbmFtZSB0aGF0IGNhbiBiZSBtYXBwZWQgdG8gYSBwYXRoLlxuXHRcdFx0ICogQHBhcmFtIHtTdHJpbmd9IG5hbWUgdGhlIHJlbGF0aXZlIG5hbWVcblx0XHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBiYXNlTmFtZSBhIHJlYWwgbmFtZSB0aGF0IHRoZSBuYW1lIGFyZyBpcyByZWxhdGl2ZVxuXHRcdFx0ICogdG8uXG5cdFx0XHQgKiBAcGFyYW0ge0Jvb2xlYW59IGFwcGx5TWFwIGFwcGx5IHRoZSBtYXAgY29uZmlnIHRvIHRoZSB2YWx1ZS4gU2hvdWxkXG5cdFx0XHQgKiBvbmx5IGJlIGRvbmUgaWYgdGhpcyBub3JtYWxpemF0aW9uIGlzIGZvciBhIGRlcGVuZGVuY3kgSUQuXG5cdFx0XHQgKiBAcmV0dXJucyB7U3RyaW5nfSBub3JtYWxpemVkIG5hbWVcblx0XHRcdCAqL1xuXHRcdFx0ZnVuY3Rpb24gbm9ybWFsaXplKG5hbWUsIGJhc2VOYW1lLCBhcHBseU1hcCkge1xuXHRcdFx0XHR2YXIgcGtnTWFpbiwgbWFwVmFsdWUsIG5hbWVQYXJ0cywgaSwgaiwgbmFtZVNlZ21lbnQsIGxhc3RJbmRleCxcblx0XHRcdFx0XHRmb3VuZE1hcCwgZm91bmRJLCBmb3VuZFN0YXJNYXAsIHN0YXJJLCBub3JtYWxpemVkQmFzZVBhcnRzLFxuXHRcdFx0XHRcdGJhc2VQYXJ0cyA9IChiYXNlTmFtZSAmJiBiYXNlTmFtZS5zcGxpdCgnLycpKSxcblx0XHRcdFx0XHRtYXAgPSBjb25maWcubWFwLFxuXHRcdFx0XHRcdHN0YXJNYXAgPSBtYXAgJiYgbWFwWycqJ107XG5cblx0XHRcdFx0Ly9BZGp1c3QgYW55IHJlbGF0aXZlIHBhdGhzLlxuXHRcdFx0XHRpZiAobmFtZSkge1xuXHRcdFx0XHRcdG5hbWUgPSBuYW1lLnNwbGl0KCcvJyk7XG5cdFx0XHRcdFx0bGFzdEluZGV4ID0gbmFtZS5sZW5ndGggLSAxO1xuXG5cdFx0XHRcdFx0Ly8gSWYgd2FudGluZyBub2RlIElEIGNvbXBhdGliaWxpdHksIHN0cmlwIC5qcyBmcm9tIGVuZFxuXHRcdFx0XHRcdC8vIG9mIElEcy4gSGF2ZSB0byBkbyB0aGlzIGhlcmUsIGFuZCBub3QgaW4gbmFtZVRvVXJsXG5cdFx0XHRcdFx0Ly8gYmVjYXVzZSBub2RlIGFsbG93cyBlaXRoZXIgLmpzIG9yIG5vbiAuanMgdG8gbWFwXG5cdFx0XHRcdFx0Ly8gdG8gc2FtZSBmaWxlLlxuXHRcdFx0XHRcdGlmIChjb25maWcubm9kZUlkQ29tcGF0ICYmIGpzU3VmZml4UmVnRXhwLnRlc3QobmFtZVtsYXN0SW5kZXhdKSkge1xuXHRcdFx0XHRcdFx0bmFtZVtsYXN0SW5kZXhdID0gbmFtZVtsYXN0SW5kZXhdLnJlcGxhY2UoanNTdWZmaXhSZWdFeHAsICcnKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvLyBTdGFydHMgd2l0aCBhICcuJyBzbyBuZWVkIHRoZSBiYXNlTmFtZVxuXHRcdFx0XHRcdGlmIChuYW1lWzBdLmNoYXJBdCgwKSA9PT0gJy4nICYmIGJhc2VQYXJ0cykge1xuXHRcdFx0XHRcdFx0Ly9Db252ZXJ0IGJhc2VOYW1lIHRvIGFycmF5LCBhbmQgbG9wIG9mZiB0aGUgbGFzdCBwYXJ0LFxuXHRcdFx0XHRcdFx0Ly9zbyB0aGF0IC4gbWF0Y2hlcyB0aGF0ICdkaXJlY3RvcnknIGFuZCBub3QgbmFtZSBvZiB0aGUgYmFzZU5hbWUnc1xuXHRcdFx0XHRcdFx0Ly9tb2R1bGUuIEZvciBpbnN0YW5jZSwgYmFzZU5hbWUgb2YgJ29uZS90d28vdGhyZWUnLCBtYXBzIHRvXG5cdFx0XHRcdFx0XHQvLydvbmUvdHdvL3RocmVlLmpzJywgYnV0IHdlIHdhbnQgdGhlIGRpcmVjdG9yeSwgJ29uZS90d28nIGZvclxuXHRcdFx0XHRcdFx0Ly90aGlzIG5vcm1hbGl6YXRpb24uXG5cdFx0XHRcdFx0XHRub3JtYWxpemVkQmFzZVBhcnRzID0gYmFzZVBhcnRzLnNsaWNlKDAsIGJhc2VQYXJ0cy5sZW5ndGggLSAxKTtcblx0XHRcdFx0XHRcdG5hbWUgPSBub3JtYWxpemVkQmFzZVBhcnRzLmNvbmNhdChuYW1lKTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHR0cmltRG90cyhuYW1lKTtcblx0XHRcdFx0XHRuYW1lID0gbmFtZS5qb2luKCcvJyk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0FwcGx5IG1hcCBjb25maWcgaWYgYXZhaWxhYmxlLlxuXHRcdFx0XHRpZiAoYXBwbHlNYXAgJiYgbWFwICYmIChiYXNlUGFydHMgfHwgc3Rhck1hcCkpIHtcblx0XHRcdFx0XHRuYW1lUGFydHMgPSBuYW1lLnNwbGl0KCcvJyk7XG5cblx0XHRcdFx0XHRvdXRlckxvb3A6IGZvciAoaSA9IG5hbWVQYXJ0cy5sZW5ndGg7IGkgPiAwOyBpIC09IDEpIHtcblx0XHRcdFx0XHRcdG5hbWVTZWdtZW50ID0gbmFtZVBhcnRzLnNsaWNlKDAsIGkpLmpvaW4oJy8nKTtcblxuXHRcdFx0XHRcdFx0aWYgKGJhc2VQYXJ0cykge1xuXHRcdFx0XHRcdFx0XHQvL0ZpbmQgdGhlIGxvbmdlc3QgYmFzZU5hbWUgc2VnbWVudCBtYXRjaCBpbiB0aGUgY29uZmlnLlxuXHRcdFx0XHRcdFx0XHQvL1NvLCBkbyBqb2lucyBvbiB0aGUgYmlnZ2VzdCB0byBzbWFsbGVzdCBsZW5ndGhzIG9mIGJhc2VQYXJ0cy5cblx0XHRcdFx0XHRcdFx0Zm9yIChqID0gYmFzZVBhcnRzLmxlbmd0aDsgaiA+IDA7IGogLT0gMSkge1xuXHRcdFx0XHRcdFx0XHRcdG1hcFZhbHVlID0gZ2V0T3duKG1hcCwgYmFzZVBhcnRzLnNsaWNlKDAsIGopLmpvaW4oJy8nKSk7XG5cblx0XHRcdFx0XHRcdFx0XHQvL2Jhc2VOYW1lIHNlZ21lbnQgaGFzIGNvbmZpZywgZmluZCBpZiBpdCBoYXMgb25lIGZvclxuXHRcdFx0XHRcdFx0XHRcdC8vdGhpcyBuYW1lLlxuXHRcdFx0XHRcdFx0XHRcdGlmIChtYXBWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0bWFwVmFsdWUgPSBnZXRPd24obWFwVmFsdWUsIG5hbWVTZWdtZW50KTtcblx0XHRcdFx0XHRcdFx0XHRcdGlmIChtYXBWYWx1ZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHQvL01hdGNoLCB1cGRhdGUgbmFtZSB0byB0aGUgbmV3IHZhbHVlLlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRmb3VuZE1hcCA9IG1hcFZhbHVlO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRmb3VuZEkgPSBpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRicmVhayBvdXRlckxvb3A7XG5cdFx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vQ2hlY2sgZm9yIGEgc3RhciBtYXAgbWF0Y2gsIGJ1dCBqdXN0IGhvbGQgb24gdG8gaXQsXG5cdFx0XHRcdFx0XHQvL2lmIHRoZXJlIGlzIGEgc2hvcnRlciBzZWdtZW50IG1hdGNoIGxhdGVyIGluIGEgbWF0Y2hpbmdcblx0XHRcdFx0XHRcdC8vY29uZmlnLCB0aGVuIGZhdm9yIG92ZXIgdGhpcyBzdGFyIG1hcC5cblx0XHRcdFx0XHRcdGlmICghZm91bmRTdGFyTWFwICYmIHN0YXJNYXAgJiYgZ2V0T3duKHN0YXJNYXAsIG5hbWVTZWdtZW50KSkge1xuXHRcdFx0XHRcdFx0XHRmb3VuZFN0YXJNYXAgPSBnZXRPd24oc3Rhck1hcCwgbmFtZVNlZ21lbnQpO1xuXHRcdFx0XHRcdFx0XHRzdGFySSA9IGk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFmb3VuZE1hcCAmJiBmb3VuZFN0YXJNYXApIHtcblx0XHRcdFx0XHRcdGZvdW5kTWFwID0gZm91bmRTdGFyTWFwO1xuXHRcdFx0XHRcdFx0Zm91bmRJID0gc3Rhckk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKGZvdW5kTWFwKSB7XG5cdFx0XHRcdFx0XHRuYW1lUGFydHMuc3BsaWNlKDAsIGZvdW5kSSwgZm91bmRNYXApO1xuXHRcdFx0XHRcdFx0bmFtZSA9IG5hbWVQYXJ0cy5qb2luKCcvJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly8gSWYgdGhlIG5hbWUgcG9pbnRzIHRvIGEgcGFja2FnZSdzIG5hbWUsIHVzZVxuXHRcdFx0XHQvLyB0aGUgcGFja2FnZSBtYWluIGluc3RlYWQuXG5cdFx0XHRcdHBrZ01haW4gPSBnZXRPd24oY29uZmlnLnBrZ3MsIG5hbWUpO1xuXG5cdFx0XHRcdHJldHVybiBwa2dNYWluID8gcGtnTWFpbiA6IG5hbWU7XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIHJlbW92ZVNjcmlwdChuYW1lKSB7XG5cdFx0XHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdFx0XHRlYWNoKHNjcmlwdHMoKSwgZnVuY3Rpb24gKHNjcmlwdE5vZGUpIHtcblx0XHRcdFx0XHRcdGlmIChzY3JpcHROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlbW9kdWxlJykgPT09IG5hbWUgJiZcblx0XHRcdFx0XHRcdFx0XHRzY3JpcHROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlY29udGV4dCcpID09PSBjb250ZXh0LmNvbnRleHROYW1lKSB7XG5cdFx0XHRcdFx0XHRcdHNjcmlwdE5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChzY3JpcHROb2RlKTtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gaGFzUGF0aEZhbGxiYWNrKGlkKSB7XG5cdFx0XHRcdHZhciBwYXRoQ29uZmlnID0gZ2V0T3duKGNvbmZpZy5wYXRocywgaWQpO1xuXHRcdFx0XHRpZiAocGF0aENvbmZpZyAmJiBpc0FycmF5KHBhdGhDb25maWcpICYmIHBhdGhDb25maWcubGVuZ3RoID4gMSkge1xuXHRcdFx0XHRcdC8vUG9wIG9mZiB0aGUgZmlyc3QgYXJyYXkgdmFsdWUsIHNpbmNlIGl0IGZhaWxlZCwgYW5kXG5cdFx0XHRcdFx0Ly9yZXRyeVxuXHRcdFx0XHRcdHBhdGhDb25maWcuc2hpZnQoKTtcblx0XHRcdFx0XHRjb250ZXh0LnJlcXVpcmUudW5kZWYoaWQpO1xuXG5cdFx0XHRcdFx0Ly9DdXN0b20gcmVxdWlyZSB0aGF0IGRvZXMgbm90IGRvIG1hcCB0cmFuc2xhdGlvbiwgc2luY2Vcblx0XHRcdFx0XHQvL0lEIGlzIFwiYWJzb2x1dGVcIiwgYWxyZWFkeSBtYXBwZWQvcmVzb2x2ZWQuXG5cdFx0XHRcdFx0Y29udGV4dC5tYWtlUmVxdWlyZShudWxsLCB7XG5cdFx0XHRcdFx0XHRza2lwTWFwOiB0cnVlXG5cdFx0XHRcdFx0fSkoW2lkXSk7XG5cblx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL1R1cm5zIGEgcGx1Z2luIXJlc291cmNlIHRvIFtwbHVnaW4sIHJlc291cmNlXVxuXHRcdFx0Ly93aXRoIHRoZSBwbHVnaW4gYmVpbmcgdW5kZWZpbmVkIGlmIHRoZSBuYW1lXG5cdFx0XHQvL2RpZCBub3QgaGF2ZSBhIHBsdWdpbiBwcmVmaXguXG5cdFx0XHRmdW5jdGlvbiBzcGxpdFByZWZpeChuYW1lKSB7XG5cdFx0XHRcdHZhciBwcmVmaXgsXG5cdFx0XHRcdFx0aW5kZXggPSBuYW1lID8gbmFtZS5pbmRleE9mKCchJykgOiAtMTtcblx0XHRcdFx0aWYgKGluZGV4ID4gLTEpIHtcblx0XHRcdFx0XHRwcmVmaXggPSBuYW1lLnN1YnN0cmluZygwLCBpbmRleCk7XG5cdFx0XHRcdFx0bmFtZSA9IG5hbWUuc3Vic3RyaW5nKGluZGV4ICsgMSwgbmFtZS5sZW5ndGgpO1xuXHRcdFx0XHR9XG5cdFx0XHRcdHJldHVybiBbcHJlZml4LCBuYW1lXTtcblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBDcmVhdGVzIGEgbW9kdWxlIG1hcHBpbmcgdGhhdCBpbmNsdWRlcyBwbHVnaW4gcHJlZml4LCBtb2R1bGVcblx0XHRcdCAqIG5hbWUsIGFuZCBwYXRoLiBJZiBwYXJlbnRNb2R1bGVNYXAgaXMgcHJvdmlkZWQgaXQgd2lsbFxuXHRcdFx0ICogYWxzbyBub3JtYWxpemUgdGhlIG5hbWUgdmlhIHJlcXVpcmUubm9ybWFsaXplKClcblx0XHRcdCAqXG5cdFx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbmFtZSB0aGUgbW9kdWxlIG5hbWVcblx0XHRcdCAqIEBwYXJhbSB7U3RyaW5nfSBbcGFyZW50TW9kdWxlTWFwXSBwYXJlbnQgbW9kdWxlIG1hcFxuXHRcdFx0ICogZm9yIHRoZSBtb2R1bGUgbmFtZSwgdXNlZCB0byByZXNvbHZlIHJlbGF0aXZlIG5hbWVzLlxuXHRcdFx0ICogQHBhcmFtIHtCb29sZWFufSBpc05vcm1hbGl6ZWQ6IGlzIHRoZSBJRCBhbHJlYWR5IG5vcm1hbGl6ZWQuXG5cdFx0XHQgKiBUaGlzIGlzIHRydWUgaWYgdGhpcyBjYWxsIGlzIGRvbmUgZm9yIGEgZGVmaW5lKCkgbW9kdWxlIElELlxuXHRcdFx0ICogQHBhcmFtIHtCb29sZWFufSBhcHBseU1hcDogYXBwbHkgdGhlIG1hcCBjb25maWcgdG8gdGhlIElELlxuXHRcdFx0ICogU2hvdWxkIG9ubHkgYmUgdHJ1ZSBpZiB0aGlzIG1hcCBpcyBmb3IgYSBkZXBlbmRlbmN5LlxuXHRcdFx0ICpcblx0XHRcdCAqIEByZXR1cm5zIHtPYmplY3R9XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIG1ha2VNb2R1bGVNYXAobmFtZSwgcGFyZW50TW9kdWxlTWFwLCBpc05vcm1hbGl6ZWQsIGFwcGx5TWFwKSB7XG5cdFx0XHRcdHZhciB1cmwsIHBsdWdpbk1vZHVsZSwgc3VmZml4LCBuYW1lUGFydHMsXG5cdFx0XHRcdFx0cHJlZml4ID0gbnVsbCxcblx0XHRcdFx0XHRwYXJlbnROYW1lID0gcGFyZW50TW9kdWxlTWFwID8gcGFyZW50TW9kdWxlTWFwLm5hbWUgOiBudWxsLFxuXHRcdFx0XHRcdG9yaWdpbmFsTmFtZSA9IG5hbWUsXG5cdFx0XHRcdFx0aXNEZWZpbmUgPSB0cnVlLFxuXHRcdFx0XHRcdG5vcm1hbGl6ZWROYW1lID0gJyc7XG5cblx0XHRcdFx0Ly9JZiBubyBuYW1lLCB0aGVuIGl0IG1lYW5zIGl0IGlzIGEgcmVxdWlyZSBjYWxsLCBnZW5lcmF0ZSBhblxuXHRcdFx0XHQvL2ludGVybmFsIG5hbWUuXG5cdFx0XHRcdGlmICghbmFtZSkge1xuXHRcdFx0XHRcdGlzRGVmaW5lID0gZmFsc2U7XG5cdFx0XHRcdFx0bmFtZSA9ICdfQHInICsgKHJlcXVpcmVDb3VudGVyICs9IDEpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0bmFtZVBhcnRzID0gc3BsaXRQcmVmaXgobmFtZSk7XG5cdFx0XHRcdHByZWZpeCA9IG5hbWVQYXJ0c1swXTtcblx0XHRcdFx0bmFtZSA9IG5hbWVQYXJ0c1sxXTtcblxuXHRcdFx0XHRpZiAocHJlZml4KSB7XG5cdFx0XHRcdFx0cHJlZml4ID0gbm9ybWFsaXplKHByZWZpeCwgcGFyZW50TmFtZSwgYXBwbHlNYXApO1xuXHRcdFx0XHRcdHBsdWdpbk1vZHVsZSA9IGdldE93bihkZWZpbmVkLCBwcmVmaXgpO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9BY2NvdW50IGZvciByZWxhdGl2ZSBwYXRocyBpZiB0aGVyZSBpcyBhIGJhc2UgbmFtZS5cblx0XHRcdFx0aWYgKG5hbWUpIHtcblx0XHRcdFx0XHRpZiAocHJlZml4KSB7XG5cdFx0XHRcdFx0XHRpZiAoaXNOb3JtYWxpemVkKSB7XG5cdFx0XHRcdFx0XHRcdG5vcm1hbGl6ZWROYW1lID0gbmFtZTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAocGx1Z2luTW9kdWxlICYmIHBsdWdpbk1vZHVsZS5ub3JtYWxpemUpIHtcblx0XHRcdFx0XHRcdFx0Ly9QbHVnaW4gaXMgbG9hZGVkLCB1c2UgaXRzIG5vcm1hbGl6ZSBtZXRob2QuXG5cdFx0XHRcdFx0XHRcdG5vcm1hbGl6ZWROYW1lID0gcGx1Z2luTW9kdWxlLm5vcm1hbGl6ZShuYW1lLCBmdW5jdGlvbiAobmFtZSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBub3JtYWxpemUobmFtZSwgcGFyZW50TmFtZSwgYXBwbHlNYXApO1xuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vIElmIG5lc3RlZCBwbHVnaW4gcmVmZXJlbmNlcywgdGhlbiBkbyBub3QgdHJ5IHRvXG5cdFx0XHRcdFx0XHRcdC8vIG5vcm1hbGl6ZSwgYXMgaXQgd2lsbCBub3Qgbm9ybWFsaXplIGNvcnJlY3RseS4gVGhpc1xuXHRcdFx0XHRcdFx0XHQvLyBwbGFjZXMgYSByZXN0cmljdGlvbiBvbiByZXNvdXJjZUlkcywgYW5kIHRoZSBsb25nZXJcblx0XHRcdFx0XHRcdFx0Ly8gdGVybSBzb2x1dGlvbiBpcyBub3QgdG8gbm9ybWFsaXplIHVudGlsIHBsdWdpbnMgYXJlXG5cdFx0XHRcdFx0XHRcdC8vIGxvYWRlZCBhbmQgYWxsIG5vcm1hbGl6YXRpb25zIHRvIGFsbG93IGZvciBhc3luY1xuXHRcdFx0XHRcdFx0XHQvLyBsb2FkaW5nIG9mIGEgbG9hZGVyIHBsdWdpbi4gQnV0IGZvciBub3csIGZpeGVzIHRoZVxuXHRcdFx0XHRcdFx0XHQvLyBjb21tb24gdXNlcy4gRGV0YWlscyBpbiAjMTEzMVxuXHRcdFx0XHRcdFx0XHRub3JtYWxpemVkTmFtZSA9IG5hbWUuaW5kZXhPZignIScpID09PSAtMSA/XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0IG5vcm1hbGl6ZShuYW1lLCBwYXJlbnROYW1lLCBhcHBseU1hcCkgOlxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdCBuYW1lO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvL0EgcmVndWxhciBtb2R1bGUuXG5cdFx0XHRcdFx0XHRub3JtYWxpemVkTmFtZSA9IG5vcm1hbGl6ZShuYW1lLCBwYXJlbnROYW1lLCBhcHBseU1hcCk7XG5cblx0XHRcdFx0XHRcdC8vTm9ybWFsaXplZCBuYW1lIG1heSBiZSBhIHBsdWdpbiBJRCBkdWUgdG8gbWFwIGNvbmZpZ1xuXHRcdFx0XHRcdFx0Ly9hcHBsaWNhdGlvbiBpbiBub3JtYWxpemUuIFRoZSBtYXAgY29uZmlnIHZhbHVlcyBtdXN0XG5cdFx0XHRcdFx0XHQvL2FscmVhZHkgYmUgbm9ybWFsaXplZCwgc28gZG8gbm90IG5lZWQgdG8gcmVkbyB0aGF0IHBhcnQuXG5cdFx0XHRcdFx0XHRuYW1lUGFydHMgPSBzcGxpdFByZWZpeChub3JtYWxpemVkTmFtZSk7XG5cdFx0XHRcdFx0XHRwcmVmaXggPSBuYW1lUGFydHNbMF07XG5cdFx0XHRcdFx0XHRub3JtYWxpemVkTmFtZSA9IG5hbWVQYXJ0c1sxXTtcblx0XHRcdFx0XHRcdGlzTm9ybWFsaXplZCA9IHRydWU7XG5cblx0XHRcdFx0XHRcdHVybCA9IGNvbnRleHQubmFtZVRvVXJsKG5vcm1hbGl6ZWROYW1lKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0lmIHRoZSBpZCBpcyBhIHBsdWdpbiBpZCB0aGF0IGNhbm5vdCBiZSBkZXRlcm1pbmVkIGlmIGl0IG5lZWRzXG5cdFx0XHRcdC8vbm9ybWFsaXphdGlvbiwgc3RhbXAgaXQgd2l0aCBhIHVuaXF1ZSBJRCBzbyB0d28gbWF0Y2hpbmcgcmVsYXRpdmVcblx0XHRcdFx0Ly9pZHMgdGhhdCBtYXkgY29uZmxpY3QgY2FuIGJlIHNlcGFyYXRlLlxuXHRcdFx0XHRzdWZmaXggPSBwcmVmaXggJiYgIXBsdWdpbk1vZHVsZSAmJiAhaXNOb3JtYWxpemVkID9cblx0XHRcdFx0XHRcdCAnX3Vubm9ybWFsaXplZCcgKyAodW5ub3JtYWxpemVkQ291bnRlciArPSAxKSA6XG5cdFx0XHRcdFx0XHQgJyc7XG5cblx0XHRcdFx0cmV0dXJuIHtcblx0XHRcdFx0XHRwcmVmaXg6IHByZWZpeCxcblx0XHRcdFx0XHRuYW1lOiBub3JtYWxpemVkTmFtZSxcblx0XHRcdFx0XHRwYXJlbnRNYXA6IHBhcmVudE1vZHVsZU1hcCxcblx0XHRcdFx0XHR1bm5vcm1hbGl6ZWQ6ICEhc3VmZml4LFxuXHRcdFx0XHRcdHVybDogdXJsLFxuXHRcdFx0XHRcdG9yaWdpbmFsTmFtZTogb3JpZ2luYWxOYW1lLFxuXHRcdFx0XHRcdGlzRGVmaW5lOiBpc0RlZmluZSxcblx0XHRcdFx0XHRpZDogKHByZWZpeCA/XG5cdFx0XHRcdFx0XHRcdHByZWZpeCArICchJyArIG5vcm1hbGl6ZWROYW1lIDpcblx0XHRcdFx0XHRcdFx0bm9ybWFsaXplZE5hbWUpICsgc3VmZml4XG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGdldE1vZHVsZShkZXBNYXApIHtcblx0XHRcdFx0dmFyIGlkID0gZGVwTWFwLmlkLFxuXHRcdFx0XHRcdG1vZCA9IGdldE93bihyZWdpc3RyeSwgaWQpO1xuXG5cdFx0XHRcdGlmICghbW9kKSB7XG5cdFx0XHRcdFx0bW9kID0gcmVnaXN0cnlbaWRdID0gbmV3IGNvbnRleHQuTW9kdWxlKGRlcE1hcCk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRyZXR1cm4gbW9kO1xuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBvbihkZXBNYXAsIG5hbWUsIGZuKSB7XG5cdFx0XHRcdHZhciBpZCA9IGRlcE1hcC5pZCxcblx0XHRcdFx0XHRtb2QgPSBnZXRPd24ocmVnaXN0cnksIGlkKTtcblxuXHRcdFx0XHRpZiAoaGFzUHJvcChkZWZpbmVkLCBpZCkgJiZcblx0XHRcdFx0XHRcdCghbW9kIHx8IG1vZC5kZWZpbmVFbWl0Q29tcGxldGUpKSB7XG5cdFx0XHRcdFx0aWYgKG5hbWUgPT09ICdkZWZpbmVkJykge1xuXHRcdFx0XHRcdFx0Zm4oZGVmaW5lZFtpZF0pO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRtb2QgPSBnZXRNb2R1bGUoZGVwTWFwKTtcblx0XHRcdFx0XHRpZiAobW9kLmVycm9yICYmIG5hbWUgPT09ICdlcnJvcicpIHtcblx0XHRcdFx0XHRcdGZuKG1vZC5lcnJvcik7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdG1vZC5vbihuYW1lLCBmbik7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIG9uRXJyb3IoZXJyLCBlcnJiYWNrKSB7XG5cdFx0XHRcdHZhciBpZHMgPSBlcnIucmVxdWlyZU1vZHVsZXMsXG5cdFx0XHRcdFx0bm90aWZpZWQgPSBmYWxzZTtcblxuXHRcdFx0XHRpZiAoZXJyYmFjaykge1xuXHRcdFx0XHRcdGVycmJhY2soZXJyKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRlYWNoKGlkcywgZnVuY3Rpb24gKGlkKSB7XG5cdFx0XHRcdFx0XHR2YXIgbW9kID0gZ2V0T3duKHJlZ2lzdHJ5LCBpZCk7XG5cdFx0XHRcdFx0XHRpZiAobW9kKSB7XG5cdFx0XHRcdFx0XHRcdC8vU2V0IGVycm9yIG9uIG1vZHVsZSwgc28gaXQgc2tpcHMgdGltZW91dCBjaGVja3MuXG5cdFx0XHRcdFx0XHRcdG1vZC5lcnJvciA9IGVycjtcblx0XHRcdFx0XHRcdFx0aWYgKG1vZC5ldmVudHMuZXJyb3IpIHtcblx0XHRcdFx0XHRcdFx0XHRub3RpZmllZCA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdFx0bW9kLmVtaXQoJ2Vycm9yJywgZXJyKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0aWYgKCFub3RpZmllZCkge1xuXHRcdFx0XHRcdFx0cmVxLm9uRXJyb3IoZXJyKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0LyoqXG5cdFx0XHQgKiBJbnRlcm5hbCBtZXRob2QgdG8gdHJhbnNmZXIgZ2xvYmFsUXVldWUgaXRlbXMgdG8gdGhpcyBjb250ZXh0J3Ncblx0XHRcdCAqIGRlZlF1ZXVlLlxuXHRcdFx0ICovXG5cdFx0XHRmdW5jdGlvbiB0YWtlR2xvYmFsUXVldWUoKSB7XG5cdFx0XHRcdC8vUHVzaCBhbGwgdGhlIGdsb2JhbERlZlF1ZXVlIGl0ZW1zIGludG8gdGhlIGNvbnRleHQncyBkZWZRdWV1ZVxuXHRcdFx0XHRpZiAoZ2xvYmFsRGVmUXVldWUubGVuZ3RoKSB7XG5cdFx0XHRcdFx0ZWFjaChnbG9iYWxEZWZRdWV1ZSwgZnVuY3Rpb24ocXVldWVJdGVtKSB7XG5cdFx0XHRcdFx0XHR2YXIgaWQgPSBxdWV1ZUl0ZW1bMF07XG5cdFx0XHRcdFx0XHRpZiAodHlwZW9mIGlkID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmRlZlF1ZXVlTWFwW2lkXSA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRkZWZRdWV1ZS5wdXNoKHF1ZXVlSXRlbSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0Z2xvYmFsRGVmUXVldWUgPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRoYW5kbGVycyA9IHtcblx0XHRcdFx0J3JlcXVpcmUnOiBmdW5jdGlvbiAobW9kKSB7XG5cdFx0XHRcdFx0aWYgKG1vZC5yZXF1aXJlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbW9kLnJlcXVpcmU7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHJldHVybiAobW9kLnJlcXVpcmUgPSBjb250ZXh0Lm1ha2VSZXF1aXJlKG1vZC5tYXApKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cdFx0XHRcdCdleHBvcnRzJzogZnVuY3Rpb24gKG1vZCkge1xuXHRcdFx0XHRcdG1vZC51c2luZ0V4cG9ydHMgPSB0cnVlO1xuXHRcdFx0XHRcdGlmIChtb2QubWFwLmlzRGVmaW5lKSB7XG5cdFx0XHRcdFx0XHRpZiAobW9kLmV4cG9ydHMpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIChkZWZpbmVkW21vZC5tYXAuaWRdID0gbW9kLmV4cG9ydHMpO1xuXHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIChtb2QuZXhwb3J0cyA9IGRlZmluZWRbbW9kLm1hcC5pZF0gPSB7fSk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXHRcdFx0XHQnbW9kdWxlJzogZnVuY3Rpb24gKG1vZCkge1xuXHRcdFx0XHRcdGlmIChtb2QubW9kdWxlKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gbW9kLm1vZHVsZTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0cmV0dXJuIChtb2QubW9kdWxlID0ge1xuXHRcdFx0XHRcdFx0XHRpZDogbW9kLm1hcC5pZCxcblx0XHRcdFx0XHRcdFx0dXJpOiBtb2QubWFwLnVybCxcblx0XHRcdFx0XHRcdFx0Y29uZmlnOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIGdldE93bihjb25maWcuY29uZmlnLCBtb2QubWFwLmlkKSB8fCB7fTtcblx0XHRcdFx0XHRcdFx0fSxcblx0XHRcdFx0XHRcdFx0ZXhwb3J0czogbW9kLmV4cG9ydHMgfHwgKG1vZC5leHBvcnRzID0ge30pXG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH07XG5cblx0XHRcdGZ1bmN0aW9uIGNsZWFuUmVnaXN0cnkoaWQpIHtcblx0XHRcdFx0Ly9DbGVhbiB1cCBtYWNoaW5lcnkgdXNlZCBmb3Igd2FpdGluZyBtb2R1bGVzLlxuXHRcdFx0XHRkZWxldGUgcmVnaXN0cnlbaWRdO1xuXHRcdFx0XHRkZWxldGUgZW5hYmxlZFJlZ2lzdHJ5W2lkXTtcblx0XHRcdH1cblxuXHRcdFx0ZnVuY3Rpb24gYnJlYWtDeWNsZShtb2QsIHRyYWNlZCwgcHJvY2Vzc2VkKSB7XG5cdFx0XHRcdHZhciBpZCA9IG1vZC5tYXAuaWQ7XG5cblx0XHRcdFx0aWYgKG1vZC5lcnJvcikge1xuXHRcdFx0XHRcdG1vZC5lbWl0KCdlcnJvcicsIG1vZC5lcnJvcik7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0dHJhY2VkW2lkXSA9IHRydWU7XG5cdFx0XHRcdFx0ZWFjaChtb2QuZGVwTWFwcywgZnVuY3Rpb24gKGRlcE1hcCwgaSkge1xuXHRcdFx0XHRcdFx0dmFyIGRlcElkID0gZGVwTWFwLmlkLFxuXHRcdFx0XHRcdFx0XHRkZXAgPSBnZXRPd24ocmVnaXN0cnksIGRlcElkKTtcblxuXHRcdFx0XHRcdFx0Ly9Pbmx5IGZvcmNlIHRoaW5ncyB0aGF0IGhhdmUgbm90IGNvbXBsZXRlZFxuXHRcdFx0XHRcdFx0Ly9iZWluZyBkZWZpbmVkLCBzbyBzdGlsbCBpbiB0aGUgcmVnaXN0cnksXG5cdFx0XHRcdFx0XHQvL2FuZCBvbmx5IGlmIGl0IGhhcyBub3QgYmVlbiBtYXRjaGVkIHVwXG5cdFx0XHRcdFx0XHQvL2luIHRoZSBtb2R1bGUgYWxyZWFkeS5cblx0XHRcdFx0XHRcdGlmIChkZXAgJiYgIW1vZC5kZXBNYXRjaGVkW2ldICYmICFwcm9jZXNzZWRbZGVwSWRdKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChnZXRPd24odHJhY2VkLCBkZXBJZCkpIHtcblx0XHRcdFx0XHRcdFx0XHRtb2QuZGVmaW5lRGVwKGksIGRlZmluZWRbZGVwSWRdKTtcblx0XHRcdFx0XHRcdFx0XHRtb2QuY2hlY2soKTsgLy9wYXNzIGZhbHNlP1xuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrQ3ljbGUoZGVwLCB0cmFjZWQsIHByb2Nlc3NlZCk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRwcm9jZXNzZWRbaWRdID0gdHJ1ZTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiBjaGVja0xvYWRlZCgpIHtcblx0XHRcdFx0dmFyIGVyciwgdXNpbmdQYXRoRmFsbGJhY2ssXG5cdFx0XHRcdFx0d2FpdEludGVydmFsID0gY29uZmlnLndhaXRTZWNvbmRzICogMTAwMCxcblx0XHRcdFx0XHQvL0l0IGlzIHBvc3NpYmxlIHRvIGRpc2FibGUgdGhlIHdhaXQgaW50ZXJ2YWwgYnkgdXNpbmcgd2FpdFNlY29uZHMgb2YgMC5cblx0XHRcdFx0XHRleHBpcmVkID0gd2FpdEludGVydmFsICYmIChjb250ZXh0LnN0YXJ0VGltZSArIHdhaXRJbnRlcnZhbCkgPCBuZXcgRGF0ZSgpLmdldFRpbWUoKSxcblx0XHRcdFx0XHRub0xvYWRzID0gW10sXG5cdFx0XHRcdFx0cmVxQ2FsbHMgPSBbXSxcblx0XHRcdFx0XHRzdGlsbExvYWRpbmcgPSBmYWxzZSxcblx0XHRcdFx0XHRuZWVkQ3ljbGVDaGVjayA9IHRydWU7XG5cblx0XHRcdFx0Ly9EbyBub3QgYm90aGVyIGlmIHRoaXMgY2FsbCB3YXMgYSByZXN1bHQgb2YgYSBjeWNsZSBicmVhay5cblx0XHRcdFx0aWYgKGluQ2hlY2tMb2FkZWQpIHtcblx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdH1cblxuXHRcdFx0XHRpbkNoZWNrTG9hZGVkID0gdHJ1ZTtcblxuXHRcdFx0XHQvL0ZpZ3VyZSBvdXQgdGhlIHN0YXRlIG9mIGFsbCB0aGUgbW9kdWxlcy5cblx0XHRcdFx0ZWFjaFByb3AoZW5hYmxlZFJlZ2lzdHJ5LCBmdW5jdGlvbiAobW9kKSB7XG5cdFx0XHRcdFx0dmFyIG1hcCA9IG1vZC5tYXAsXG5cdFx0XHRcdFx0XHRtb2RJZCA9IG1hcC5pZDtcblxuXHRcdFx0XHRcdC8vU2tpcCB0aGluZ3MgdGhhdCBhcmUgbm90IGVuYWJsZWQgb3IgaW4gZXJyb3Igc3RhdGUuXG5cdFx0XHRcdFx0aWYgKCFtb2QuZW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGlmICghbWFwLmlzRGVmaW5lKSB7XG5cdFx0XHRcdFx0XHRyZXFDYWxscy5wdXNoKG1vZCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0aWYgKCFtb2QuZXJyb3IpIHtcblx0XHRcdFx0XHRcdC8vSWYgdGhlIG1vZHVsZSBzaG91bGQgYmUgZXhlY3V0ZWQsIGFuZCBpdCBoYXMgbm90XG5cdFx0XHRcdFx0XHQvL2JlZW4gaW5pdGVkIGFuZCB0aW1lIGlzIHVwLCByZW1lbWJlciBpdC5cblx0XHRcdFx0XHRcdGlmICghbW9kLmluaXRlZCAmJiBleHBpcmVkKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChoYXNQYXRoRmFsbGJhY2sobW9kSWQpKSB7XG5cdFx0XHRcdFx0XHRcdFx0dXNpbmdQYXRoRmFsbGJhY2sgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRcdHN0aWxsTG9hZGluZyA9IHRydWU7XG5cdFx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdFx0bm9Mb2Fkcy5wdXNoKG1vZElkKTtcblx0XHRcdFx0XHRcdFx0XHRyZW1vdmVTY3JpcHQobW9kSWQpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHR9IGVsc2UgaWYgKCFtb2QuaW5pdGVkICYmIG1vZC5mZXRjaGVkICYmIG1hcC5pc0RlZmluZSkge1xuXHRcdFx0XHRcdFx0XHRzdGlsbExvYWRpbmcgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRpZiAoIW1hcC5wcmVmaXgpIHtcblx0XHRcdFx0XHRcdFx0XHQvL05vIHJlYXNvbiB0byBrZWVwIGxvb2tpbmcgZm9yIHVuZmluaXNoZWRcblx0XHRcdFx0XHRcdFx0XHQvL2xvYWRpbmcuIElmIHRoZSBvbmx5IHN0aWxsTG9hZGluZyBpcyBhXG5cdFx0XHRcdFx0XHRcdFx0Ly9wbHVnaW4gcmVzb3VyY2UgdGhvdWdoLCBrZWVwIGdvaW5nLFxuXHRcdFx0XHRcdFx0XHRcdC8vYmVjYXVzZSBpdCBtYXkgYmUgdGhhdCBhIHBsdWdpbiByZXNvdXJjZVxuXHRcdFx0XHRcdFx0XHRcdC8vaXMgd2FpdGluZyBvbiBhIG5vbi1wbHVnaW4gY3ljbGUuXG5cdFx0XHRcdFx0XHRcdFx0cmV0dXJuIChuZWVkQ3ljbGVDaGVjayA9IGZhbHNlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSk7XG5cblx0XHRcdFx0aWYgKGV4cGlyZWQgJiYgbm9Mb2Fkcy5sZW5ndGgpIHtcblx0XHRcdFx0XHQvL0lmIHdhaXQgdGltZSBleHBpcmVkLCB0aHJvdyBlcnJvciBvZiB1bmxvYWRlZCBtb2R1bGVzLlxuXHRcdFx0XHRcdGVyciA9IG1ha2VFcnJvcigndGltZW91dCcsICdMb2FkIHRpbWVvdXQgZm9yIG1vZHVsZXM6ICcgKyBub0xvYWRzLCBudWxsLCBub0xvYWRzKTtcblx0XHRcdFx0XHRlcnIuY29udGV4dE5hbWUgPSBjb250ZXh0LmNvbnRleHROYW1lO1xuXHRcdFx0XHRcdHJldHVybiBvbkVycm9yKGVycik7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL05vdCBleHBpcmVkLCBjaGVjayBmb3IgYSBjeWNsZS5cblx0XHRcdFx0aWYgKG5lZWRDeWNsZUNoZWNrKSB7XG5cdFx0XHRcdFx0ZWFjaChyZXFDYWxscywgZnVuY3Rpb24gKG1vZCkge1xuXHRcdFx0XHRcdFx0YnJlYWtDeWNsZShtb2QsIHt9LCB7fSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvL0lmIHN0aWxsIHdhaXRpbmcgb24gbG9hZHMsIGFuZCB0aGUgd2FpdGluZyBsb2FkIGlzIHNvbWV0aGluZ1xuXHRcdFx0XHQvL290aGVyIHRoYW4gYSBwbHVnaW4gcmVzb3VyY2UsIG9yIHRoZXJlIGFyZSBzdGlsbCBvdXRzdGFuZGluZ1xuXHRcdFx0XHQvL3NjcmlwdHMsIHRoZW4ganVzdCB0cnkgYmFjayBsYXRlci5cblx0XHRcdFx0aWYgKCghZXhwaXJlZCB8fCB1c2luZ1BhdGhGYWxsYmFjaykgJiYgc3RpbGxMb2FkaW5nKSB7XG5cdFx0XHRcdFx0Ly9Tb21ldGhpbmcgaXMgc3RpbGwgd2FpdGluZyB0byBsb2FkLiBXYWl0IGZvciBpdCwgYnV0IG9ubHlcblx0XHRcdFx0XHQvL2lmIGEgdGltZW91dCBpcyBub3QgYWxyZWFkeSBpbiBlZmZlY3QuXG5cdFx0XHRcdFx0aWYgKChpc0Jyb3dzZXIgfHwgaXNXZWJXb3JrZXIpICYmICFjaGVja0xvYWRlZFRpbWVvdXRJZCkge1xuXHRcdFx0XHRcdFx0Y2hlY2tMb2FkZWRUaW1lb3V0SWQgPSBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0Y2hlY2tMb2FkZWRUaW1lb3V0SWQgPSAwO1xuXHRcdFx0XHRcdFx0XHRjaGVja0xvYWRlZCgpO1xuXHRcdFx0XHRcdFx0fSwgNTApO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXG5cdFx0XHRcdGluQ2hlY2tMb2FkZWQgPSBmYWxzZTtcblx0XHRcdH1cblxuXHRcdFx0TW9kdWxlID0gZnVuY3Rpb24gKG1hcCkge1xuXHRcdFx0XHR0aGlzLmV2ZW50cyA9IGdldE93bih1bmRlZkV2ZW50cywgbWFwLmlkKSB8fCB7fTtcblx0XHRcdFx0dGhpcy5tYXAgPSBtYXA7XG5cdFx0XHRcdHRoaXMuc2hpbSA9IGdldE93bihjb25maWcuc2hpbSwgbWFwLmlkKTtcblx0XHRcdFx0dGhpcy5kZXBFeHBvcnRzID0gW107XG5cdFx0XHRcdHRoaXMuZGVwTWFwcyA9IFtdO1xuXHRcdFx0XHR0aGlzLmRlcE1hdGNoZWQgPSBbXTtcblx0XHRcdFx0dGhpcy5wbHVnaW5NYXBzID0ge307XG5cdFx0XHRcdHRoaXMuZGVwQ291bnQgPSAwO1xuXG5cdFx0XHRcdC8qIHRoaXMuZXhwb3J0cyB0aGlzLmZhY3Rvcnlcblx0XHRcdFx0ICAgdGhpcy5kZXBNYXBzID0gW10sXG5cdFx0XHRcdCAgIHRoaXMuZW5hYmxlZCwgdGhpcy5mZXRjaGVkXG5cdFx0XHRcdCovXG5cdFx0XHR9O1xuXG5cdFx0XHRNb2R1bGUucHJvdG90eXBlID0ge1xuXHRcdFx0XHRpbml0OiBmdW5jdGlvbiAoZGVwTWFwcywgZmFjdG9yeSwgZXJyYmFjaywgb3B0aW9ucykge1xuXHRcdFx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0XHRcdFx0Ly9EbyBub3QgZG8gbW9yZSBpbml0cyBpZiBhbHJlYWR5IGRvbmUuIENhbiBoYXBwZW4gaWYgdGhlcmVcblx0XHRcdFx0XHQvL2FyZSBtdWx0aXBsZSBkZWZpbmUgY2FsbHMgZm9yIHRoZSBzYW1lIG1vZHVsZS4gVGhhdCBpcyBub3Rcblx0XHRcdFx0XHQvL2Egbm9ybWFsLCBjb21tb24gY2FzZSwgYnV0IGl0IGlzIGFsc28gbm90IHVuZXhwZWN0ZWQuXG5cdFx0XHRcdFx0aWYgKHRoaXMuaW5pdGVkKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0dGhpcy5mYWN0b3J5ID0gZmFjdG9yeTtcblxuXHRcdFx0XHRcdGlmIChlcnJiYWNrKSB7XG5cdFx0XHRcdFx0XHQvL1JlZ2lzdGVyIGZvciBlcnJvcnMgb24gdGhpcyBtb2R1bGUuXG5cdFx0XHRcdFx0XHR0aGlzLm9uKCdlcnJvcicsIGVycmJhY2spO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5ldmVudHMuZXJyb3IpIHtcblx0XHRcdFx0XHRcdC8vSWYgbm8gZXJyYmFjayBhbHJlYWR5LCBidXQgdGhlcmUgYXJlIGVycm9yIGxpc3RlbmVyc1xuXHRcdFx0XHRcdFx0Ly9vbiB0aGlzIG1vZHVsZSwgc2V0IHVwIGFuIGVycmJhY2sgdG8gcGFzcyB0byB0aGUgZGVwcy5cblx0XHRcdFx0XHRcdGVycmJhY2sgPSBiaW5kKHRoaXMsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL0RvIGEgY29weSBvZiB0aGUgZGVwZW5kZW5jeSBhcnJheSwgc28gdGhhdFxuXHRcdFx0XHRcdC8vc291cmNlIGlucHV0cyBhcmUgbm90IG1vZGlmaWVkLiBGb3IgZXhhbXBsZVxuXHRcdFx0XHRcdC8vXCJzaGltXCIgZGVwcyBhcmUgcGFzc2VkIGluIGhlcmUgZGlyZWN0bHksIGFuZFxuXHRcdFx0XHRcdC8vZG9pbmcgYSBkaXJlY3QgbW9kaWZpY2F0aW9uIG9mIHRoZSBkZXBNYXBzIGFycmF5XG5cdFx0XHRcdFx0Ly93b3VsZCBhZmZlY3QgdGhhdCBjb25maWcuXG5cdFx0XHRcdFx0dGhpcy5kZXBNYXBzID0gZGVwTWFwcyAmJiBkZXBNYXBzLnNsaWNlKDApO1xuXG5cdFx0XHRcdFx0dGhpcy5lcnJiYWNrID0gZXJyYmFjaztcblxuXHRcdFx0XHRcdC8vSW5kaWNhdGUgdGhpcyBtb2R1bGUgaGFzIGJlIGluaXRpYWxpemVkXG5cdFx0XHRcdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXG5cdFx0XHRcdFx0dGhpcy5pZ25vcmUgPSBvcHRpb25zLmlnbm9yZTtcblxuXHRcdFx0XHRcdC8vQ291bGQgaGF2ZSBvcHRpb24gdG8gaW5pdCB0aGlzIG1vZHVsZSBpbiBlbmFibGVkIG1vZGUsXG5cdFx0XHRcdFx0Ly9vciBjb3VsZCBoYXZlIGJlZW4gcHJldmlvdXNseSBtYXJrZWQgYXMgZW5hYmxlZC4gSG93ZXZlcixcblx0XHRcdFx0XHQvL3RoZSBkZXBlbmRlbmNpZXMgYXJlIG5vdCBrbm93biB1bnRpbCBpbml0IGlzIGNhbGxlZC4gU29cblx0XHRcdFx0XHQvL2lmIGVuYWJsZWQgcHJldmlvdXNseSwgbm93IHRyaWdnZXIgZGVwZW5kZW5jaWVzIGFzIGVuYWJsZWQuXG5cdFx0XHRcdFx0aWYgKG9wdGlvbnMuZW5hYmxlZCB8fCB0aGlzLmVuYWJsZWQpIHtcblx0XHRcdFx0XHRcdC8vRW5hYmxlIHRoaXMgbW9kdWxlIGFuZCBkZXBlbmRlbmNpZXMuXG5cdFx0XHRcdFx0XHQvL1dpbGwgY2FsbCB0aGlzLmNoZWNrKClcblx0XHRcdFx0XHRcdHRoaXMuZW5hYmxlKCk7XG5cdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdHRoaXMuY2hlY2soKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0ZGVmaW5lRGVwOiBmdW5jdGlvbiAoaSwgZGVwRXhwb3J0cykge1xuXHRcdFx0XHRcdC8vQmVjYXVzZSBvZiBjeWNsZXMsIGRlZmluZWQgY2FsbGJhY2sgZm9yIGEgZ2l2ZW5cblx0XHRcdFx0XHQvL2V4cG9ydCBjYW4gYmUgY2FsbGVkIG1vcmUgdGhhbiBvbmNlLlxuXHRcdFx0XHRcdGlmICghdGhpcy5kZXBNYXRjaGVkW2ldKSB7XG5cdFx0XHRcdFx0XHR0aGlzLmRlcE1hdGNoZWRbaV0gPSB0cnVlO1xuXHRcdFx0XHRcdFx0dGhpcy5kZXBDb3VudCAtPSAxO1xuXHRcdFx0XHRcdFx0dGhpcy5kZXBFeHBvcnRzW2ldID0gZGVwRXhwb3J0cztcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0ZmV0Y2g6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRpZiAodGhpcy5mZXRjaGVkKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHRoaXMuZmV0Y2hlZCA9IHRydWU7XG5cblx0XHRcdFx0XHRjb250ZXh0LnN0YXJ0VGltZSA9IChuZXcgRGF0ZSgpKS5nZXRUaW1lKCk7XG5cblx0XHRcdFx0XHR2YXIgbWFwID0gdGhpcy5tYXA7XG5cblx0XHRcdFx0XHQvL0lmIHRoZSBtYW5hZ2VyIGlzIGZvciBhIHBsdWdpbiBtYW5hZ2VkIHJlc291cmNlLFxuXHRcdFx0XHRcdC8vYXNrIHRoZSBwbHVnaW4gdG8gbG9hZCBpdCBub3cuXG5cdFx0XHRcdFx0aWYgKHRoaXMuc2hpbSkge1xuXHRcdFx0XHRcdFx0Y29udGV4dC5tYWtlUmVxdWlyZSh0aGlzLm1hcCwge1xuXHRcdFx0XHRcdFx0XHRlbmFibGVCdWlsZENhbGxiYWNrOiB0cnVlXG5cdFx0XHRcdFx0XHR9KSh0aGlzLnNoaW0uZGVwcyB8fCBbXSwgYmluZCh0aGlzLCBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0XHRcdHJldHVybiBtYXAucHJlZml4ID8gdGhpcy5jYWxsUGx1Z2luKCkgOiB0aGlzLmxvYWQoKTtcblx0XHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0Ly9SZWd1bGFyIGRlcGVuZGVuY3kuXG5cdFx0XHRcdFx0XHRyZXR1cm4gbWFwLnByZWZpeCA/IHRoaXMuY2FsbFBsdWdpbigpIDogdGhpcy5sb2FkKCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGxvYWQ6IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR2YXIgdXJsID0gdGhpcy5tYXAudXJsO1xuXG5cdFx0XHRcdFx0Ly9SZWd1bGFyIGRlcGVuZGVuY3kuXG5cdFx0XHRcdFx0aWYgKCF1cmxGZXRjaGVkW3VybF0pIHtcblx0XHRcdFx0XHRcdHVybEZldGNoZWRbdXJsXSA9IHRydWU7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmxvYWQodGhpcy5tYXAuaWQsIHVybCk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBDaGVja3MgaWYgdGhlIG1vZHVsZSBpcyByZWFkeSB0byBkZWZpbmUgaXRzZWxmLCBhbmQgaWYgc28sXG5cdFx0XHRcdCAqIGRlZmluZSBpdC5cblx0XHRcdFx0ICovXG5cdFx0XHRcdGNoZWNrOiBmdW5jdGlvbiAoKSB7XG5cdFx0XHRcdFx0aWYgKCF0aGlzLmVuYWJsZWQgfHwgdGhpcy5lbmFibGluZykge1xuXHRcdFx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdHZhciBlcnIsIGNqc01vZHVsZSxcblx0XHRcdFx0XHRcdGlkID0gdGhpcy5tYXAuaWQsXG5cdFx0XHRcdFx0XHRkZXBFeHBvcnRzID0gdGhpcy5kZXBFeHBvcnRzLFxuXHRcdFx0XHRcdFx0ZXhwb3J0cyA9IHRoaXMuZXhwb3J0cyxcblx0XHRcdFx0XHRcdGZhY3RvcnkgPSB0aGlzLmZhY3Rvcnk7XG5cblx0XHRcdFx0XHRpZiAoIXRoaXMuaW5pdGVkKSB7XG5cdFx0XHRcdFx0XHQvLyBPbmx5IGZldGNoIGlmIG5vdCBhbHJlYWR5IGluIHRoZSBkZWZRdWV1ZS5cblx0XHRcdFx0XHRcdGlmICghaGFzUHJvcChjb250ZXh0LmRlZlF1ZXVlTWFwLCBpZCkpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5mZXRjaCgpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0gZWxzZSBpZiAodGhpcy5lcnJvcikge1xuXHRcdFx0XHRcdFx0dGhpcy5lbWl0KCdlcnJvcicsIHRoaXMuZXJyb3IpO1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAoIXRoaXMuZGVmaW5pbmcpIHtcblx0XHRcdFx0XHRcdC8vVGhlIGZhY3RvcnkgY291bGQgdHJpZ2dlciBhbm90aGVyIHJlcXVpcmUgY2FsbFxuXHRcdFx0XHRcdFx0Ly90aGF0IHdvdWxkIHJlc3VsdCBpbiBjaGVja2luZyB0aGlzIG1vZHVsZSB0b1xuXHRcdFx0XHRcdFx0Ly9kZWZpbmUgaXRzZWxmIGFnYWluLiBJZiBhbHJlYWR5IGluIHRoZSBwcm9jZXNzXG5cdFx0XHRcdFx0XHQvL29mIGRvaW5nIHRoYXQsIHNraXAgdGhpcyB3b3JrLlxuXHRcdFx0XHRcdFx0dGhpcy5kZWZpbmluZyA9IHRydWU7XG5cblx0XHRcdFx0XHRcdGlmICh0aGlzLmRlcENvdW50IDwgMSAmJiAhdGhpcy5kZWZpbmVkKSB7XG5cdFx0XHRcdFx0XHRcdGlmIChpc0Z1bmN0aW9uKGZhY3RvcnkpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly9JZiB0aGVyZSBpcyBhbiBlcnJvciBsaXN0ZW5lciwgZmF2b3IgcGFzc2luZ1xuXHRcdFx0XHRcdFx0XHRcdC8vdG8gdGhhdCBpbnN0ZWFkIG9mIHRocm93aW5nIGFuIGVycm9yLiBIb3dldmVyLFxuXHRcdFx0XHRcdFx0XHRcdC8vb25seSBkbyBpdCBmb3IgZGVmaW5lKCknZCAgbW9kdWxlcy4gcmVxdWlyZVxuXHRcdFx0XHRcdFx0XHRcdC8vZXJyYmFja3Mgc2hvdWxkIG5vdCBiZSBjYWxsZWQgZm9yIGZhaWx1cmVzIGluXG5cdFx0XHRcdFx0XHRcdFx0Ly90aGVpciBjYWxsYmFja3MgKCM2OTkpLiBIb3dldmVyIGlmIGEgZ2xvYmFsXG5cdFx0XHRcdFx0XHRcdFx0Ly9vbkVycm9yIGlzIHNldCwgdXNlIHRoYXQuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKCh0aGlzLmV2ZW50cy5lcnJvciAmJiB0aGlzLm1hcC5pc0RlZmluZSkgfHxcblx0XHRcdFx0XHRcdFx0XHRcdHJlcS5vbkVycm9yICE9PSBkZWZhdWx0T25FcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZXhwb3J0cyA9IGNvbnRleHQuZXhlY0NiKGlkLCBmYWN0b3J5LCBkZXBFeHBvcnRzLCBleHBvcnRzKTtcblx0XHRcdFx0XHRcdFx0XHRcdH0gY2F0Y2ggKGUpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZXJyID0gZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZXhwb3J0cyA9IGNvbnRleHQuZXhlY0NiKGlkLCBmYWN0b3J5LCBkZXBFeHBvcnRzLCBleHBvcnRzKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHQvLyBGYXZvciByZXR1cm4gdmFsdWUgb3ZlciBleHBvcnRzLiBJZiBub2RlL2NqcyBpbiBwbGF5LFxuXHRcdFx0XHRcdFx0XHRcdC8vIHRoZW4gd2lsbCBub3QgaGF2ZSBhIHJldHVybiB2YWx1ZSBhbnl3YXkuIEZhdm9yXG5cdFx0XHRcdFx0XHRcdFx0Ly8gbW9kdWxlLmV4cG9ydHMgYXNzaWdubWVudCBvdmVyIGV4cG9ydHMgb2JqZWN0LlxuXHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLm1hcC5pc0RlZmluZSAmJiBleHBvcnRzID09PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdGNqc01vZHVsZSA9IHRoaXMubW9kdWxlO1xuXHRcdFx0XHRcdFx0XHRcdFx0aWYgKGNqc01vZHVsZSkge1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRleHBvcnRzID0gY2pzTW9kdWxlLmV4cG9ydHM7XG5cdFx0XHRcdFx0XHRcdFx0XHR9IGVsc2UgaWYgKHRoaXMudXNpbmdFeHBvcnRzKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdC8vZXhwb3J0cyBhbHJlYWR5IHNldCB0aGUgZGVmaW5lZCB2YWx1ZS5cblx0XHRcdFx0XHRcdFx0XHRcdFx0ZXhwb3J0cyA9IHRoaXMuZXhwb3J0cztcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRpZiAoZXJyKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRlcnIucmVxdWlyZU1hcCA9IHRoaXMubWFwO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZXJyLnJlcXVpcmVNb2R1bGVzID0gdGhpcy5tYXAuaXNEZWZpbmUgPyBbdGhpcy5tYXAuaWRdIDogbnVsbDtcblx0XHRcdFx0XHRcdFx0XHRcdGVyci5yZXF1aXJlVHlwZSA9IHRoaXMubWFwLmlzRGVmaW5lID8gJ2RlZmluZScgOiAncmVxdWlyZSc7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb25FcnJvcigodGhpcy5lcnJvciA9IGVycikpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRcdC8vSnVzdCBhIGxpdGVyYWwgdmFsdWVcblx0XHRcdFx0XHRcdFx0XHRleHBvcnRzID0gZmFjdG9yeTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHRoaXMuZXhwb3J0cyA9IGV4cG9ydHM7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHRoaXMubWFwLmlzRGVmaW5lICYmICF0aGlzLmlnbm9yZSkge1xuXHRcdFx0XHRcdFx0XHRcdGRlZmluZWRbaWRdID0gZXhwb3J0cztcblxuXHRcdFx0XHRcdFx0XHRcdGlmIChyZXEub25SZXNvdXJjZUxvYWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHZhciByZXNMb2FkTWFwcyA9IFtdO1xuXHRcdFx0XHRcdFx0XHRcdFx0ZWFjaCh0aGlzLmRlcE1hcHMsIGZ1bmN0aW9uIChkZXBNYXApIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0cmVzTG9hZE1hcHMucHVzaChkZXBNYXAubm9ybWFsaXplZE1hcCB8fCBkZXBNYXApO1xuXHRcdFx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXEub25SZXNvdXJjZUxvYWQoY29udGV4dCwgdGhpcy5tYXAsIHJlc0xvYWRNYXBzKTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvL0NsZWFuIHVwXG5cdFx0XHRcdFx0XHRcdGNsZWFuUmVnaXN0cnkoaWQpO1xuXG5cdFx0XHRcdFx0XHRcdHRoaXMuZGVmaW5lZCA9IHRydWU7XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vRmluaXNoZWQgdGhlIGRlZmluZSBzdGFnZS4gQWxsb3cgY2FsbGluZyBjaGVjayBhZ2FpblxuXHRcdFx0XHRcdFx0Ly90byBhbGxvdyBkZWZpbmUgbm90aWZpY2F0aW9ucyBiZWxvdyBpbiB0aGUgY2FzZSBvZiBhXG5cdFx0XHRcdFx0XHQvL2N5Y2xlLlxuXHRcdFx0XHRcdFx0dGhpcy5kZWZpbmluZyA9IGZhbHNlO1xuXG5cdFx0XHRcdFx0XHRpZiAodGhpcy5kZWZpbmVkICYmICF0aGlzLmRlZmluZUVtaXR0ZWQpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5kZWZpbmVFbWl0dGVkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0dGhpcy5lbWl0KCdkZWZpbmVkJywgdGhpcy5leHBvcnRzKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5kZWZpbmVFbWl0Q29tcGxldGUgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGNhbGxQbHVnaW46IGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHR2YXIgbWFwID0gdGhpcy5tYXAsXG5cdFx0XHRcdFx0XHRpZCA9IG1hcC5pZCxcblx0XHRcdFx0XHRcdC8vTWFwIGFscmVhZHkgbm9ybWFsaXplZCB0aGUgcHJlZml4LlxuXHRcdFx0XHRcdFx0cGx1Z2luTWFwID0gbWFrZU1vZHVsZU1hcChtYXAucHJlZml4KTtcblxuXHRcdFx0XHRcdC8vTWFyayB0aGlzIGFzIGEgZGVwZW5kZW5jeSBmb3IgdGhpcyBwbHVnaW4sIHNvIGl0XG5cdFx0XHRcdFx0Ly9jYW4gYmUgdHJhY2VkIGZvciBjeWNsZXMuXG5cdFx0XHRcdFx0dGhpcy5kZXBNYXBzLnB1c2gocGx1Z2luTWFwKTtcblxuXHRcdFx0XHRcdG9uKHBsdWdpbk1hcCwgJ2RlZmluZWQnLCBiaW5kKHRoaXMsIGZ1bmN0aW9uIChwbHVnaW4pIHtcblx0XHRcdFx0XHRcdHZhciBsb2FkLCBub3JtYWxpemVkTWFwLCBub3JtYWxpemVkTW9kLFxuXHRcdFx0XHRcdFx0XHRidW5kbGVJZCA9IGdldE93bihidW5kbGVzTWFwLCB0aGlzLm1hcC5pZCksXG5cdFx0XHRcdFx0XHRcdG5hbWUgPSB0aGlzLm1hcC5uYW1lLFxuXHRcdFx0XHRcdFx0XHRwYXJlbnROYW1lID0gdGhpcy5tYXAucGFyZW50TWFwID8gdGhpcy5tYXAucGFyZW50TWFwLm5hbWUgOiBudWxsLFxuXHRcdFx0XHRcdFx0XHRsb2NhbFJlcXVpcmUgPSBjb250ZXh0Lm1ha2VSZXF1aXJlKG1hcC5wYXJlbnRNYXAsIHtcblx0XHRcdFx0XHRcdFx0XHRlbmFibGVCdWlsZENhbGxiYWNrOiB0cnVlXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHQvL0lmIGN1cnJlbnQgbWFwIGlzIG5vdCBub3JtYWxpemVkLCB3YWl0IGZvciB0aGF0XG5cdFx0XHRcdFx0XHQvL25vcm1hbGl6ZWQgbmFtZSB0byBsb2FkIGluc3RlYWQgb2YgY29udGludWluZy5cblx0XHRcdFx0XHRcdGlmICh0aGlzLm1hcC51bm5vcm1hbGl6ZWQpIHtcblx0XHRcdFx0XHRcdFx0Ly9Ob3JtYWxpemUgdGhlIElEIGlmIHRoZSBwbHVnaW4gYWxsb3dzIGl0LlxuXHRcdFx0XHRcdFx0XHRpZiAocGx1Z2luLm5vcm1hbGl6ZSkge1xuXHRcdFx0XHRcdFx0XHRcdG5hbWUgPSBwbHVnaW4ubm9ybWFsaXplKG5hbWUsIGZ1bmN0aW9uIChuYW1lKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gbm9ybWFsaXplKG5hbWUsIHBhcmVudE5hbWUsIHRydWUpO1xuXHRcdFx0XHRcdFx0XHRcdH0pIHx8ICcnO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly9wcmVmaXggYW5kIG5hbWUgc2hvdWxkIGFscmVhZHkgYmUgbm9ybWFsaXplZCwgbm8gbmVlZFxuXHRcdFx0XHRcdFx0XHQvL2ZvciBhcHBseWluZyBtYXAgY29uZmlnIGFnYWluIGVpdGhlci5cblx0XHRcdFx0XHRcdFx0bm9ybWFsaXplZE1hcCA9IG1ha2VNb2R1bGVNYXAobWFwLnByZWZpeCArICchJyArIG5hbWUsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICB0aGlzLm1hcC5wYXJlbnRNYXAsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICB0cnVlKTtcblx0XHRcdFx0XHRcdFx0b24obm9ybWFsaXplZE1hcCxcblx0XHRcdFx0XHRcdFx0XHQnZGVmaW5lZCcsIGJpbmQodGhpcywgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHR0aGlzLm1hcC5ub3JtYWxpemVkTWFwID0gbm9ybWFsaXplZE1hcDtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuaW5pdChbXSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWU7IH0sIG51bGwsIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0ZW5hYmxlZDogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0aWdub3JlOiB0cnVlXG5cdFx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0XHR9KSk7XG5cblx0XHRcdFx0XHRcdFx0bm9ybWFsaXplZE1vZCA9IGdldE93bihyZWdpc3RyeSwgbm9ybWFsaXplZE1hcC5pZCk7XG5cdFx0XHRcdFx0XHRcdGlmIChub3JtYWxpemVkTW9kKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly9NYXJrIHRoaXMgYXMgYSBkZXBlbmRlbmN5IGZvciB0aGlzIHBsdWdpbiwgc28gaXRcblx0XHRcdFx0XHRcdFx0XHQvL2NhbiBiZSB0cmFjZWQgZm9yIGN5Y2xlcy5cblx0XHRcdFx0XHRcdFx0XHR0aGlzLmRlcE1hcHMucHVzaChub3JtYWxpemVkTWFwKTtcblxuXHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLmV2ZW50cy5lcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdFx0bm9ybWFsaXplZE1vZC5vbignZXJyb3InLCBiaW5kKHRoaXMsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdFx0dGhpcy5lbWl0KCdlcnJvcicsIGVycik7XG5cdFx0XHRcdFx0XHRcdFx0XHR9KSk7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRcdG5vcm1hbGl6ZWRNb2QuZW5hYmxlKCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm47XG5cdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdC8vSWYgYSBwYXRocyBjb25maWcsIHRoZW4ganVzdCBsb2FkIHRoYXQgZmlsZSBpbnN0ZWFkIHRvXG5cdFx0XHRcdFx0XHQvL3Jlc29sdmUgdGhlIHBsdWdpbiwgYXMgaXQgaXMgYnVpbHQgaW50byB0aGF0IHBhdGhzIGxheWVyLlxuXHRcdFx0XHRcdFx0aWYgKGJ1bmRsZUlkKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMubWFwLnVybCA9IGNvbnRleHQubmFtZVRvVXJsKGJ1bmRsZUlkKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5sb2FkKCk7XG5cdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0bG9hZCA9IGJpbmQodGhpcywgZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0XHRcdHRoaXMuaW5pdChbXSwgZnVuY3Rpb24gKCkgeyByZXR1cm4gdmFsdWU7IH0sIG51bGwsIHtcblx0XHRcdFx0XHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdGxvYWQuZXJyb3IgPSBiaW5kKHRoaXMsIGZ1bmN0aW9uIChlcnIpIHtcblx0XHRcdFx0XHRcdFx0dGhpcy5pbml0ZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHR0aGlzLmVycm9yID0gZXJyO1xuXHRcdFx0XHRcdFx0XHRlcnIucmVxdWlyZU1vZHVsZXMgPSBbaWRdO1xuXG5cdFx0XHRcdFx0XHRcdC8vUmVtb3ZlIHRlbXAgdW5ub3JtYWxpemVkIG1vZHVsZXMgZm9yIHRoaXMgbW9kdWxlLFxuXHRcdFx0XHRcdFx0XHQvL3NpbmNlIHRoZXkgd2lsbCBuZXZlciBiZSByZXNvbHZlZCBvdGhlcndpc2Ugbm93LlxuXHRcdFx0XHRcdFx0XHRlYWNoUHJvcChyZWdpc3RyeSwgZnVuY3Rpb24gKG1vZCkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChtb2QubWFwLmlkLmluZGV4T2YoaWQgKyAnX3Vubm9ybWFsaXplZCcpID09PSAwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRjbGVhblJlZ2lzdHJ5KG1vZC5tYXAuaWQpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdFx0b25FcnJvcihlcnIpO1xuXHRcdFx0XHRcdFx0fSk7XG5cblx0XHRcdFx0XHRcdC8vQWxsb3cgcGx1Z2lucyB0byBsb2FkIG90aGVyIGNvZGUgd2l0aG91dCBoYXZpbmcgdG8ga25vdyB0aGVcblx0XHRcdFx0XHRcdC8vY29udGV4dCBvciBob3cgdG8gJ2NvbXBsZXRlJyB0aGUgbG9hZC5cblx0XHRcdFx0XHRcdGxvYWQuZnJvbVRleHQgPSBiaW5kKHRoaXMsIGZ1bmN0aW9uICh0ZXh0LCB0ZXh0QWx0KSB7XG5cdFx0XHRcdFx0XHRcdC8qanNsaW50IGV2aWw6IHRydWUgKi9cblx0XHRcdFx0XHRcdFx0dmFyIG1vZHVsZU5hbWUgPSBtYXAubmFtZSxcblx0XHRcdFx0XHRcdFx0XHRtb2R1bGVNYXAgPSBtYWtlTW9kdWxlTWFwKG1vZHVsZU5hbWUpLFxuXHRcdFx0XHRcdFx0XHRcdGhhc0ludGVyYWN0aXZlID0gdXNlSW50ZXJhY3RpdmU7XG5cblx0XHRcdFx0XHRcdFx0Ly9BcyBvZiAyLjEuMCwgc3VwcG9ydCBqdXN0IHBhc3NpbmcgdGhlIHRleHQsIHRvIHJlaW5mb3JjZVxuXHRcdFx0XHRcdFx0XHQvL2Zyb21UZXh0IG9ubHkgYmVpbmcgY2FsbGVkIG9uY2UgcGVyIHJlc291cmNlLiBTdGlsbFxuXHRcdFx0XHRcdFx0XHQvL3N1cHBvcnQgb2xkIHN0eWxlIG9mIHBhc3NpbmcgbW9kdWxlTmFtZSBidXQgZGlzY2FyZFxuXHRcdFx0XHRcdFx0XHQvL3RoYXQgbW9kdWxlTmFtZSBpbiBmYXZvciBvZiB0aGUgaW50ZXJuYWwgcmVmLlxuXHRcdFx0XHRcdFx0XHRpZiAodGV4dEFsdCkge1xuXHRcdFx0XHRcdFx0XHRcdHRleHQgPSB0ZXh0QWx0O1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0Ly9UdXJuIG9mZiBpbnRlcmFjdGl2ZSBzY3JpcHQgbWF0Y2hpbmcgZm9yIElFIGZvciBhbnkgZGVmaW5lXG5cdFx0XHRcdFx0XHRcdC8vY2FsbHMgaW4gdGhlIHRleHQsIHRoZW4gdHVybiBpdCBiYWNrIG9uIGF0IHRoZSBlbmQuXG5cdFx0XHRcdFx0XHRcdGlmIChoYXNJbnRlcmFjdGl2ZSkge1xuXHRcdFx0XHRcdFx0XHRcdHVzZUludGVyYWN0aXZlID0gZmFsc2U7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvL1ByaW1lIHRoZSBzeXN0ZW0gYnkgY3JlYXRpbmcgYSBtb2R1bGUgaW5zdGFuY2UgZm9yXG5cdFx0XHRcdFx0XHRcdC8vaXQuXG5cdFx0XHRcdFx0XHRcdGdldE1vZHVsZShtb2R1bGVNYXApO1xuXG5cdFx0XHRcdFx0XHRcdC8vVHJhbnNmZXIgYW55IGNvbmZpZyB0byB0aGlzIG90aGVyIG1vZHVsZS5cblx0XHRcdFx0XHRcdFx0aWYgKGhhc1Byb3AoY29uZmlnLmNvbmZpZywgaWQpKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uZmlnLmNvbmZpZ1ttb2R1bGVOYW1lXSA9IGNvbmZpZy5jb25maWdbaWRdO1xuXHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0dHJ5IHtcblx0XHRcdFx0XHRcdFx0XHRyZXEuZXhlYyh0ZXh0KTtcblx0XHRcdFx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvbkVycm9yKG1ha2VFcnJvcignZnJvbXRleHRldmFsJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCAnZnJvbVRleHQgZXZhbCBmb3IgJyArIGlkICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCcgZmFpbGVkOiAnICsgZSxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCBlLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0IFtpZF0pKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdGlmIChoYXNJbnRlcmFjdGl2ZSkge1xuXHRcdFx0XHRcdFx0XHRcdHVzZUludGVyYWN0aXZlID0gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vTWFyayB0aGlzIGFzIGEgZGVwZW5kZW5jeSBmb3IgdGhlIHBsdWdpblxuXHRcdFx0XHRcdFx0XHQvL3Jlc291cmNlXG5cdFx0XHRcdFx0XHRcdHRoaXMuZGVwTWFwcy5wdXNoKG1vZHVsZU1hcCk7XG5cblx0XHRcdFx0XHRcdFx0Ly9TdXBwb3J0IGFub255bW91cyBtb2R1bGVzLlxuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmNvbXBsZXRlTG9hZChtb2R1bGVOYW1lKTtcblxuXHRcdFx0XHRcdFx0XHQvL0JpbmQgdGhlIHZhbHVlIG9mIHRoYXQgbW9kdWxlIHRvIHRoZSB2YWx1ZSBmb3IgdGhpc1xuXHRcdFx0XHRcdFx0XHQvL3Jlc291cmNlIElELlxuXHRcdFx0XHRcdFx0XHRsb2NhbFJlcXVpcmUoW21vZHVsZU5hbWVdLCBsb2FkKTtcblx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHQvL1VzZSBwYXJlbnROYW1lIGhlcmUgc2luY2UgdGhlIHBsdWdpbidzIG5hbWUgaXMgbm90IHJlbGlhYmxlLFxuXHRcdFx0XHRcdFx0Ly9jb3VsZCBiZSBzb21lIHdlaXJkIHN0cmluZyB3aXRoIG5vIHBhdGggdGhhdCBhY3R1YWxseSB3YW50cyB0b1xuXHRcdFx0XHRcdFx0Ly9yZWZlcmVuY2UgdGhlIHBhcmVudE5hbWUncyBwYXRoLlxuXHRcdFx0XHRcdFx0cGx1Z2luLmxvYWQobWFwLm5hbWUsIGxvY2FsUmVxdWlyZSwgbG9hZCwgY29uZmlnKTtcblx0XHRcdFx0XHR9KSk7XG5cblx0XHRcdFx0XHRjb250ZXh0LmVuYWJsZShwbHVnaW5NYXAsIHRoaXMpO1xuXHRcdFx0XHRcdHRoaXMucGx1Z2luTWFwc1twbHVnaW5NYXAuaWRdID0gcGx1Z2luTWFwO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdGVuYWJsZTogZnVuY3Rpb24gKCkge1xuXHRcdFx0XHRcdGVuYWJsZWRSZWdpc3RyeVt0aGlzLm1hcC5pZF0gPSB0aGlzO1xuXHRcdFx0XHRcdHRoaXMuZW5hYmxlZCA9IHRydWU7XG5cblx0XHRcdFx0XHQvL1NldCBmbGFnIG1lbnRpb25pbmcgdGhhdCB0aGUgbW9kdWxlIGlzIGVuYWJsaW5nLFxuXHRcdFx0XHRcdC8vc28gdGhhdCBpbW1lZGlhdGUgY2FsbHMgdG8gdGhlIGRlZmluZWQgY2FsbGJhY2tzXG5cdFx0XHRcdFx0Ly9mb3IgZGVwZW5kZW5jaWVzIGRvIG5vdCB0cmlnZ2VyIGluYWR2ZXJ0ZW50IGxvYWRcblx0XHRcdFx0XHQvL3dpdGggdGhlIGRlcENvdW50IHN0aWxsIGJlaW5nIHplcm8uXG5cdFx0XHRcdFx0dGhpcy5lbmFibGluZyA9IHRydWU7XG5cblx0XHRcdFx0XHQvL0VuYWJsZSBlYWNoIGRlcGVuZGVuY3lcblx0XHRcdFx0XHRlYWNoKHRoaXMuZGVwTWFwcywgYmluZCh0aGlzLCBmdW5jdGlvbiAoZGVwTWFwLCBpKSB7XG5cdFx0XHRcdFx0XHR2YXIgaWQsIG1vZCwgaGFuZGxlcjtcblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBkZXBNYXAgPT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdFx0XHRcdC8vRGVwZW5kZW5jeSBuZWVkcyB0byBiZSBjb252ZXJ0ZWQgdG8gYSBkZXBNYXBcblx0XHRcdFx0XHRcdFx0Ly9hbmQgd2lyZWQgdXAgdG8gdGhpcyBtb2R1bGUuXG5cdFx0XHRcdFx0XHRcdGRlcE1hcCA9IG1ha2VNb2R1bGVNYXAoZGVwTWFwLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICAgKHRoaXMubWFwLmlzRGVmaW5lID8gdGhpcy5tYXAgOiB0aGlzLm1hcC5wYXJlbnRNYXApLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0ICAgZmFsc2UsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgICAhdGhpcy5za2lwTWFwKTtcblx0XHRcdFx0XHRcdFx0dGhpcy5kZXBNYXBzW2ldID0gZGVwTWFwO1xuXG5cdFx0XHRcdFx0XHRcdGhhbmRsZXIgPSBnZXRPd24oaGFuZGxlcnMsIGRlcE1hcC5pZCk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKGhhbmRsZXIpIHtcblx0XHRcdFx0XHRcdFx0XHR0aGlzLmRlcEV4cG9ydHNbaV0gPSBoYW5kbGVyKHRoaXMpO1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdHRoaXMuZGVwQ291bnQgKz0gMTtcblxuXHRcdFx0XHRcdFx0XHRvbihkZXBNYXAsICdkZWZpbmVkJywgYmluZCh0aGlzLCBmdW5jdGlvbiAoZGVwRXhwb3J0cykge1xuXHRcdFx0XHRcdFx0XHRcdGlmICh0aGlzLnVuZGVmZWQpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5kZWZpbmVEZXAoaSwgZGVwRXhwb3J0cyk7XG5cdFx0XHRcdFx0XHRcdFx0dGhpcy5jaGVjaygpO1xuXHRcdFx0XHRcdFx0XHR9KSk7XG5cblx0XHRcdFx0XHRcdFx0aWYgKHRoaXMuZXJyYmFjaykge1xuXHRcdFx0XHRcdFx0XHRcdG9uKGRlcE1hcCwgJ2Vycm9yJywgYmluZCh0aGlzLCB0aGlzLmVycmJhY2spKTtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIGlmICh0aGlzLmV2ZW50cy5lcnJvcikge1xuXHRcdFx0XHRcdFx0XHRcdC8vIE5vIGRpcmVjdCBlcnJiYWNrIG9uIHRoaXMgbW9kdWxlLCBidXQgc29tZXRoaW5nXG5cdFx0XHRcdFx0XHRcdFx0Ly8gZWxzZSBpcyBsaXN0ZW5pbmcgZm9yIGVycm9ycywgc28gYmUgc3VyZSB0b1xuXHRcdFx0XHRcdFx0XHRcdC8vIHByb3BhZ2F0ZSB0aGUgZXJyb3IgY29ycmVjdGx5LlxuXHRcdFx0XHRcdFx0XHRcdG9uKGRlcE1hcCwgJ2Vycm9yJywgYmluZCh0aGlzLCBmdW5jdGlvbihlcnIpIHtcblx0XHRcdFx0XHRcdFx0XHRcdHRoaXMuZW1pdCgnZXJyb3InLCBlcnIpO1xuXHRcdFx0XHRcdFx0XHRcdH0pKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRpZCA9IGRlcE1hcC5pZDtcblx0XHRcdFx0XHRcdG1vZCA9IHJlZ2lzdHJ5W2lkXTtcblxuXHRcdFx0XHRcdFx0Ly9Ta2lwIHNwZWNpYWwgbW9kdWxlcyBsaWtlICdyZXF1aXJlJywgJ2V4cG9ydHMnLCAnbW9kdWxlJ1xuXHRcdFx0XHRcdFx0Ly9BbHNvLCBkb24ndCBjYWxsIGVuYWJsZSBpZiBpdCBpcyBhbHJlYWR5IGVuYWJsZWQsXG5cdFx0XHRcdFx0XHQvL2ltcG9ydGFudCBpbiBjaXJjdWxhciBkZXBlbmRlbmN5IGNhc2VzLlxuXHRcdFx0XHRcdFx0aWYgKCFoYXNQcm9wKGhhbmRsZXJzLCBpZCkgJiYgbW9kICYmICFtb2QuZW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmVuYWJsZShkZXBNYXAsIHRoaXMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblxuXHRcdFx0XHRcdC8vRW5hYmxlIGVhY2ggcGx1Z2luIHRoYXQgaXMgdXNlZCBpblxuXHRcdFx0XHRcdC8vYSBkZXBlbmRlbmN5XG5cdFx0XHRcdFx0ZWFjaFByb3AodGhpcy5wbHVnaW5NYXBzLCBiaW5kKHRoaXMsIGZ1bmN0aW9uIChwbHVnaW5NYXApIHtcblx0XHRcdFx0XHRcdHZhciBtb2QgPSBnZXRPd24ocmVnaXN0cnksIHBsdWdpbk1hcC5pZCk7XG5cdFx0XHRcdFx0XHRpZiAobW9kICYmICFtb2QuZW5hYmxlZCkge1xuXHRcdFx0XHRcdFx0XHRjb250ZXh0LmVuYWJsZShwbHVnaW5NYXAsIHRoaXMpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pKTtcblxuXHRcdFx0XHRcdHRoaXMuZW5hYmxpbmcgPSBmYWxzZTtcblxuXHRcdFx0XHRcdHRoaXMuY2hlY2soKTtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHRvbjogZnVuY3Rpb24gKG5hbWUsIGNiKSB7XG5cdFx0XHRcdFx0dmFyIGNicyA9IHRoaXMuZXZlbnRzW25hbWVdO1xuXHRcdFx0XHRcdGlmICghY2JzKSB7XG5cdFx0XHRcdFx0XHRjYnMgPSB0aGlzLmV2ZW50c1tuYW1lXSA9IFtdO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjYnMucHVzaChjYik7XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0ZW1pdDogZnVuY3Rpb24gKG5hbWUsIGV2dCkge1xuXHRcdFx0XHRcdGVhY2godGhpcy5ldmVudHNbbmFtZV0sIGZ1bmN0aW9uIChjYikge1xuXHRcdFx0XHRcdFx0Y2IoZXZ0KTtcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRpZiAobmFtZSA9PT0gJ2Vycm9yJykge1xuXHRcdFx0XHRcdFx0Ly9Ob3cgdGhhdCB0aGUgZXJyb3IgaGFuZGxlciB3YXMgdHJpZ2dlcmVkLCByZW1vdmVcblx0XHRcdFx0XHRcdC8vdGhlIGxpc3RlbmVycywgc2luY2UgdGhpcyBicm9rZW4gTW9kdWxlIGluc3RhbmNlXG5cdFx0XHRcdFx0XHQvL2NhbiBzdGF5IGFyb3VuZCBmb3IgYSB3aGlsZSBpbiB0aGUgcmVnaXN0cnkuXG5cdFx0XHRcdFx0XHRkZWxldGUgdGhpcy5ldmVudHNbbmFtZV07XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRmdW5jdGlvbiBjYWxsR2V0TW9kdWxlKGFyZ3MpIHtcblx0XHRcdFx0Ly9Ta2lwIG1vZHVsZXMgYWxyZWFkeSBkZWZpbmVkLlxuXHRcdFx0XHRpZiAoIWhhc1Byb3AoZGVmaW5lZCwgYXJnc1swXSkpIHtcblx0XHRcdFx0XHRnZXRNb2R1bGUobWFrZU1vZHVsZU1hcChhcmdzWzBdLCBudWxsLCB0cnVlKSkuaW5pdChhcmdzWzFdLCBhcmdzWzJdKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRmdW5jdGlvbiByZW1vdmVMaXN0ZW5lcihub2RlLCBmdW5jLCBuYW1lLCBpZU5hbWUpIHtcblx0XHRcdFx0Ly9GYXZvciBkZXRhY2hFdmVudCBiZWNhdXNlIG9mIElFOVxuXHRcdFx0XHQvL2lzc3VlLCBzZWUgYXR0YWNoRXZlbnQvYWRkRXZlbnRMaXN0ZW5lciBjb21tZW50IGVsc2V3aGVyZVxuXHRcdFx0XHQvL2luIHRoaXMgZmlsZS5cblx0XHRcdFx0aWYgKG5vZGUuZGV0YWNoRXZlbnQgJiYgIWlzT3BlcmEpIHtcblx0XHRcdFx0XHQvL1Byb2JhYmx5IElFLiBJZiBub3QgaXQgd2lsbCB0aHJvdyBhbiBlcnJvciwgd2hpY2ggd2lsbCBiZVxuXHRcdFx0XHRcdC8vdXNlZnVsIHRvIGtub3cuXG5cdFx0XHRcdFx0aWYgKGllTmFtZSkge1xuXHRcdFx0XHRcdFx0bm9kZS5kZXRhY2hFdmVudChpZU5hbWUsIGZ1bmMpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRub2RlLnJlbW92ZUV2ZW50TGlzdGVuZXIobmFtZSwgZnVuYywgZmFsc2UpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8qKlxuXHRcdFx0ICogR2l2ZW4gYW4gZXZlbnQgZnJvbSBhIHNjcmlwdCBub2RlLCBnZXQgdGhlIHJlcXVpcmVqcyBpbmZvIGZyb20gaXQsXG5cdFx0XHQgKiBhbmQgdGhlbiByZW1vdmVzIHRoZSBldmVudCBsaXN0ZW5lcnMgb24gdGhlIG5vZGUuXG5cdFx0XHQgKiBAcGFyYW0ge0V2ZW50fSBldnRcblx0XHRcdCAqIEByZXR1cm5zIHtPYmplY3R9XG5cdFx0XHQgKi9cblx0XHRcdGZ1bmN0aW9uIGdldFNjcmlwdERhdGEoZXZ0KSB7XG5cdFx0XHRcdC8vVXNpbmcgY3VycmVudFRhcmdldCBpbnN0ZWFkIG9mIHRhcmdldCBmb3IgRmlyZWZveCAyLjAncyBzYWtlLiBOb3Rcblx0XHRcdFx0Ly9hbGwgb2xkIGJyb3dzZXJzIHdpbGwgYmUgc3VwcG9ydGVkLCBidXQgdGhpcyBvbmUgd2FzIGVhc3kgZW5vdWdoXG5cdFx0XHRcdC8vdG8gc3VwcG9ydCBhbmQgc3RpbGwgbWFrZXMgc2Vuc2UuXG5cdFx0XHRcdHZhciBub2RlID0gZXZ0LmN1cnJlbnRUYXJnZXQgfHwgZXZ0LnNyY0VsZW1lbnQ7XG5cblx0XHRcdFx0Ly9SZW1vdmUgdGhlIGxpc3RlbmVycyBvbmNlIGhlcmUuXG5cdFx0XHRcdHJlbW92ZUxpc3RlbmVyKG5vZGUsIGNvbnRleHQub25TY3JpcHRMb2FkLCAnbG9hZCcsICdvbnJlYWR5c3RhdGVjaGFuZ2UnKTtcblx0XHRcdFx0cmVtb3ZlTGlzdGVuZXIobm9kZSwgY29udGV4dC5vblNjcmlwdEVycm9yLCAnZXJyb3InKTtcblxuXHRcdFx0XHRyZXR1cm4ge1xuXHRcdFx0XHRcdG5vZGU6IG5vZGUsXG5cdFx0XHRcdFx0aWQ6IG5vZGUgJiYgbm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVxdWlyZW1vZHVsZScpXG5cdFx0XHRcdH07XG5cdFx0XHR9XG5cblx0XHRcdGZ1bmN0aW9uIGludGFrZURlZmluZXMoKSB7XG5cdFx0XHRcdHZhciBhcmdzO1xuXG5cdFx0XHRcdC8vQW55IGRlZmluZWQgbW9kdWxlcyBpbiB0aGUgZ2xvYmFsIHF1ZXVlLCBpbnRha2UgdGhlbSBub3cuXG5cdFx0XHRcdHRha2VHbG9iYWxRdWV1ZSgpO1xuXG5cdFx0XHRcdC8vTWFrZSBzdXJlIGFueSByZW1haW5pbmcgZGVmUXVldWUgaXRlbXMgZ2V0IHByb3Blcmx5IHByb2Nlc3NlZC5cblx0XHRcdFx0d2hpbGUgKGRlZlF1ZXVlLmxlbmd0aCkge1xuXHRcdFx0XHRcdGFyZ3MgPSBkZWZRdWV1ZS5zaGlmdCgpO1xuXHRcdFx0XHRcdGlmIChhcmdzWzBdID09PSBudWxsKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb25FcnJvcihtYWtlRXJyb3IoJ21pc21hdGNoJywgJ01pc21hdGNoZWQgYW5vbnltb3VzIGRlZmluZSgpIG1vZHVsZTogJyArXG5cdFx0XHRcdFx0XHRcdGFyZ3NbYXJncy5sZW5ndGggLSAxXSkpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvL2FyZ3MgYXJlIGlkLCBkZXBzLCBmYWN0b3J5LiBTaG91bGQgYmUgbm9ybWFsaXplZCBieSB0aGVcblx0XHRcdFx0XHRcdC8vZGVmaW5lKCkgZnVuY3Rpb24uXG5cdFx0XHRcdFx0XHRjYWxsR2V0TW9kdWxlKGFyZ3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0XHRjb250ZXh0LmRlZlF1ZXVlTWFwID0ge307XG5cdFx0XHR9XG5cblx0XHRcdGNvbnRleHQgPSB7XG5cdFx0XHRcdGNvbmZpZzogY29uZmlnLFxuXHRcdFx0XHRjb250ZXh0TmFtZTogY29udGV4dE5hbWUsXG5cdFx0XHRcdHJlZ2lzdHJ5OiByZWdpc3RyeSxcblx0XHRcdFx0ZGVmaW5lZDogZGVmaW5lZCxcblx0XHRcdFx0dXJsRmV0Y2hlZDogdXJsRmV0Y2hlZCxcblx0XHRcdFx0ZGVmUXVldWU6IGRlZlF1ZXVlLFxuXHRcdFx0XHRkZWZRdWV1ZU1hcDoge30sXG5cdFx0XHRcdE1vZHVsZTogTW9kdWxlLFxuXHRcdFx0XHRtYWtlTW9kdWxlTWFwOiBtYWtlTW9kdWxlTWFwLFxuXHRcdFx0XHRuZXh0VGljazogcmVxLm5leHRUaWNrLFxuXHRcdFx0XHRvbkVycm9yOiBvbkVycm9yLFxuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBTZXQgYSBjb25maWd1cmF0aW9uIGZvciB0aGUgY29udGV4dC5cblx0XHRcdFx0ICogQHBhcmFtIHtPYmplY3R9IGNmZyBjb25maWcgb2JqZWN0IHRvIGludGVncmF0ZS5cblx0XHRcdFx0ICovXG5cdFx0XHRcdGNvbmZpZ3VyZTogZnVuY3Rpb24gKGNmZykge1xuXHRcdFx0XHRcdC8vTWFrZSBzdXJlIHRoZSBiYXNlVXJsIGVuZHMgaW4gYSBzbGFzaC5cblx0XHRcdFx0XHRpZiAoY2ZnLmJhc2VVcmwpIHtcblx0XHRcdFx0XHRcdGlmIChjZmcuYmFzZVVybC5jaGFyQXQoY2ZnLmJhc2VVcmwubGVuZ3RoIC0gMSkgIT09ICcvJykge1xuXHRcdFx0XHRcdFx0XHRjZmcuYmFzZVVybCArPSAnLyc7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly8gQ29udmVydCBvbGQgc3R5bGUgdXJsQXJncyBzdHJpbmcgdG8gYSBmdW5jdGlvbi5cblx0XHRcdFx0XHRpZiAodHlwZW9mIGNmZy51cmxBcmdzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdFx0dmFyIHVybEFyZ3MgPSBjZmcudXJsQXJncztcblx0XHRcdFx0XHRcdGNmZy51cmxBcmdzID0gZnVuY3Rpb24oaWQsIHVybCkge1xuXHRcdFx0XHRcdFx0XHRyZXR1cm4gKHVybC5pbmRleE9mKCc/JykgPT09IC0xID8gJz8nIDogJyYnKSArIHVybEFyZ3M7XG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vU2F2ZSBvZmYgdGhlIHBhdGhzIHNpbmNlIHRoZXkgcmVxdWlyZSBzcGVjaWFsIHByb2Nlc3NpbmcsXG5cdFx0XHRcdFx0Ly90aGV5IGFyZSBhZGRpdGl2ZS5cblx0XHRcdFx0XHR2YXIgc2hpbSA9IGNvbmZpZy5zaGltLFxuXHRcdFx0XHRcdFx0b2JqcyA9IHtcblx0XHRcdFx0XHRcdFx0cGF0aHM6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGJ1bmRsZXM6IHRydWUsXG5cdFx0XHRcdFx0XHRcdGNvbmZpZzogdHJ1ZSxcblx0XHRcdFx0XHRcdFx0bWFwOiB0cnVlXG5cdFx0XHRcdFx0XHR9O1xuXG5cdFx0XHRcdFx0ZWFjaFByb3AoY2ZnLCBmdW5jdGlvbiAodmFsdWUsIHByb3ApIHtcblx0XHRcdFx0XHRcdGlmIChvYmpzW3Byb3BdKSB7XG5cdFx0XHRcdFx0XHRcdGlmICghY29uZmlnW3Byb3BdKSB7XG5cdFx0XHRcdFx0XHRcdFx0Y29uZmlnW3Byb3BdID0ge307XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0bWl4aW4oY29uZmlnW3Byb3BdLCB2YWx1ZSwgdHJ1ZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjb25maWdbcHJvcF0gPSB2YWx1ZTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vUmV2ZXJzZSBtYXAgdGhlIGJ1bmRsZXNcblx0XHRcdFx0XHRpZiAoY2ZnLmJ1bmRsZXMpIHtcblx0XHRcdFx0XHRcdGVhY2hQcm9wKGNmZy5idW5kbGVzLCBmdW5jdGlvbiAodmFsdWUsIHByb3ApIHtcblx0XHRcdFx0XHRcdFx0ZWFjaCh2YWx1ZSwgZnVuY3Rpb24gKHYpIHtcblx0XHRcdFx0XHRcdFx0XHRpZiAodiAhPT0gcHJvcCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0YnVuZGxlc01hcFt2XSA9IHByb3A7XG5cdFx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdH0pO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vTWVyZ2Ugc2hpbVxuXHRcdFx0XHRcdGlmIChjZmcuc2hpbSkge1xuXHRcdFx0XHRcdFx0ZWFjaFByb3AoY2ZnLnNoaW0sIGZ1bmN0aW9uICh2YWx1ZSwgaWQpIHtcblx0XHRcdFx0XHRcdFx0Ly9Ob3JtYWxpemUgdGhlIHN0cnVjdHVyZVxuXHRcdFx0XHRcdFx0XHRpZiAoaXNBcnJheSh2YWx1ZSkpIHtcblx0XHRcdFx0XHRcdFx0XHR2YWx1ZSA9IHtcblx0XHRcdFx0XHRcdFx0XHRcdGRlcHM6IHZhbHVlXG5cdFx0XHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRpZiAoKHZhbHVlLmV4cG9ydHMgfHwgdmFsdWUuaW5pdCkgJiYgIXZhbHVlLmV4cG9ydHNGbikge1xuXHRcdFx0XHRcdFx0XHRcdHZhbHVlLmV4cG9ydHNGbiA9IGNvbnRleHQubWFrZVNoaW1FeHBvcnRzKHZhbHVlKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0XHRzaGltW2lkXSA9IHZhbHVlO1xuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRjb25maWcuc2hpbSA9IHNoaW07XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9BZGp1c3QgcGFja2FnZXMgaWYgbmVjZXNzYXJ5LlxuXHRcdFx0XHRcdGlmIChjZmcucGFja2FnZXMpIHtcblx0XHRcdFx0XHRcdGVhY2goY2ZnLnBhY2thZ2VzLCBmdW5jdGlvbiAocGtnT2JqKSB7XG5cdFx0XHRcdFx0XHRcdHZhciBsb2NhdGlvbiwgbmFtZTtcblxuXHRcdFx0XHRcdFx0XHRwa2dPYmogPSB0eXBlb2YgcGtnT2JqID09PSAnc3RyaW5nJyA/IHtuYW1lOiBwa2dPYmp9IDogcGtnT2JqO1xuXG5cdFx0XHRcdFx0XHRcdG5hbWUgPSBwa2dPYmoubmFtZTtcblx0XHRcdFx0XHRcdFx0bG9jYXRpb24gPSBwa2dPYmoubG9jYXRpb247XG5cdFx0XHRcdFx0XHRcdGlmIChsb2NhdGlvbikge1xuXHRcdFx0XHRcdFx0XHRcdGNvbmZpZy5wYXRoc1tuYW1lXSA9IHBrZ09iai5sb2NhdGlvbjtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vU2F2ZSBwb2ludGVyIHRvIG1haW4gbW9kdWxlIElEIGZvciBwa2cgbmFtZS5cblx0XHRcdFx0XHRcdFx0Ly9SZW1vdmUgbGVhZGluZyBkb3QgaW4gbWFpbiwgc28gbWFpbiBwYXRocyBhcmUgbm9ybWFsaXplZCxcblx0XHRcdFx0XHRcdFx0Ly9hbmQgcmVtb3ZlIGFueSB0cmFpbGluZyAuanMsIHNpbmNlIGRpZmZlcmVudCBwYWNrYWdlXG5cdFx0XHRcdFx0XHRcdC8vZW52cyBoYXZlIGRpZmZlcmVudCBjb252ZW50aW9uczogc29tZSB1c2UgYSBtb2R1bGUgbmFtZSxcblx0XHRcdFx0XHRcdFx0Ly9zb21lIHVzZSBhIGZpbGUgbmFtZS5cblx0XHRcdFx0XHRcdFx0Y29uZmlnLnBrZ3NbbmFtZV0gPSBwa2dPYmoubmFtZSArICcvJyArIChwa2dPYmoubWFpbiB8fCAnbWFpbicpXG5cdFx0XHRcdFx0XHRcdFx0XHRcdCAucmVwbGFjZShjdXJyRGlyUmVnRXhwLCAnJylcblx0XHRcdFx0XHRcdFx0XHRcdFx0IC5yZXBsYWNlKGpzU3VmZml4UmVnRXhwLCAnJyk7XG5cdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL0lmIHRoZXJlIGFyZSBhbnkgXCJ3YWl0aW5nIHRvIGV4ZWN1dGVcIiBtb2R1bGVzIGluIHRoZSByZWdpc3RyeSxcblx0XHRcdFx0XHQvL3VwZGF0ZSB0aGUgbWFwcyBmb3IgdGhlbSwgc2luY2UgdGhlaXIgaW5mbywgbGlrZSBVUkxzIHRvIGxvYWQsXG5cdFx0XHRcdFx0Ly9tYXkgaGF2ZSBjaGFuZ2VkLlxuXHRcdFx0XHRcdGVhY2hQcm9wKHJlZ2lzdHJ5LCBmdW5jdGlvbiAobW9kLCBpZCkge1xuXHRcdFx0XHRcdFx0Ly9JZiBtb2R1bGUgYWxyZWFkeSBoYXMgaW5pdCBjYWxsZWQsIHNpbmNlIGl0IGlzIHRvb1xuXHRcdFx0XHRcdFx0Ly9sYXRlIHRvIG1vZGlmeSB0aGVtLCBhbmQgaWdub3JlIHVubm9ybWFsaXplZCBvbmVzXG5cdFx0XHRcdFx0XHQvL3NpbmNlIHRoZXkgYXJlIHRyYW5zaWVudC5cblx0XHRcdFx0XHRcdGlmICghbW9kLmluaXRlZCAmJiAhbW9kLm1hcC51bm5vcm1hbGl6ZWQpIHtcblx0XHRcdFx0XHRcdFx0bW9kLm1hcCA9IG1ha2VNb2R1bGVNYXAoaWQsIG51bGwsIHRydWUpO1xuXHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0Ly9JZiBhIGRlcHMgYXJyYXkgb3IgYSBjb25maWcgY2FsbGJhY2sgaXMgc3BlY2lmaWVkLCB0aGVuIGNhbGxcblx0XHRcdFx0XHQvL3JlcXVpcmUgd2l0aCB0aG9zZSBhcmdzLiBUaGlzIGlzIHVzZWZ1bCB3aGVuIHJlcXVpcmUgaXMgZGVmaW5lZCBhcyBhXG5cdFx0XHRcdFx0Ly9jb25maWcgb2JqZWN0IGJlZm9yZSByZXF1aXJlLmpzIGlzIGxvYWRlZC5cblx0XHRcdFx0XHRpZiAoY2ZnLmRlcHMgfHwgY2ZnLmNhbGxiYWNrKSB7XG5cdFx0XHRcdFx0XHRjb250ZXh0LnJlcXVpcmUoY2ZnLmRlcHMgfHwgW10sIGNmZy5jYWxsYmFjayk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdG1ha2VTaGltRXhwb3J0czogZnVuY3Rpb24gKHZhbHVlKSB7XG5cdFx0XHRcdFx0ZnVuY3Rpb24gZm4oKSB7XG5cdFx0XHRcdFx0XHR2YXIgcmV0O1xuXHRcdFx0XHRcdFx0aWYgKHZhbHVlLmluaXQpIHtcblx0XHRcdFx0XHRcdFx0cmV0ID0gdmFsdWUuaW5pdC5hcHBseShnbG9iYWwsIGFyZ3VtZW50cyk7XG5cdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRyZXR1cm4gcmV0IHx8ICh2YWx1ZS5leHBvcnRzICYmIGdldEdsb2JhbCh2YWx1ZS5leHBvcnRzKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdHJldHVybiBmbjtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHRtYWtlUmVxdWlyZTogZnVuY3Rpb24gKHJlbE1hcCwgb3B0aW9ucykge1xuXHRcdFx0XHRcdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXG5cdFx0XHRcdFx0ZnVuY3Rpb24gbG9jYWxSZXF1aXJlKGRlcHMsIGNhbGxiYWNrLCBlcnJiYWNrKSB7XG5cdFx0XHRcdFx0XHR2YXIgaWQsIG1hcCwgcmVxdWlyZU1vZDtcblxuXHRcdFx0XHRcdFx0aWYgKG9wdGlvbnMuZW5hYmxlQnVpbGRDYWxsYmFjayAmJiBjYWxsYmFjayAmJiBpc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuXHRcdFx0XHRcdFx0XHRjYWxsYmFjay5fX3JlcXVpcmVKc0J1aWxkID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0aWYgKHR5cGVvZiBkZXBzID09PSAnc3RyaW5nJykge1xuXHRcdFx0XHRcdFx0XHRpZiAoaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcblx0XHRcdFx0XHRcdFx0XHQvL0ludmFsaWQgY2FsbFxuXHRcdFx0XHRcdFx0XHRcdHJldHVybiBvbkVycm9yKG1ha2VFcnJvcigncmVxdWlyZWFyZ3MnLCAnSW52YWxpZCByZXF1aXJlIGNhbGwnKSwgZXJyYmFjayk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvL0lmIHJlcXVpcmV8ZXhwb3J0c3xtb2R1bGUgYXJlIHJlcXVlc3RlZCwgZ2V0IHRoZVxuXHRcdFx0XHRcdFx0XHQvL3ZhbHVlIGZvciB0aGVtIGZyb20gdGhlIHNwZWNpYWwgaGFuZGxlcnMuIENhdmVhdDpcblx0XHRcdFx0XHRcdFx0Ly90aGlzIG9ubHkgd29ya3Mgd2hpbGUgbW9kdWxlIGlzIGJlaW5nIGRlZmluZWQuXG5cdFx0XHRcdFx0XHRcdGlmIChyZWxNYXAgJiYgaGFzUHJvcChoYW5kbGVycywgZGVwcykpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gaGFuZGxlcnNbZGVwc10ocmVnaXN0cnlbcmVsTWFwLmlkXSk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHQvL1N5bmNocm9ub3VzIGFjY2VzcyB0byBvbmUgbW9kdWxlLiBJZiByZXF1aXJlLmdldCBpc1xuXHRcdFx0XHRcdFx0XHQvL2F2YWlsYWJsZSAoYXMgaW4gdGhlIE5vZGUgYWRhcHRlciksIHByZWZlciB0aGF0LlxuXHRcdFx0XHRcdFx0XHRpZiAocmVxLmdldCkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybiByZXEuZ2V0KGNvbnRleHQsIGRlcHMsIHJlbE1hcCwgbG9jYWxSZXF1aXJlKTtcblx0XHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRcdC8vTm9ybWFsaXplIG1vZHVsZSBuYW1lLCBpZiBpdCBjb250YWlucyAuIG9yIC4uXG5cdFx0XHRcdFx0XHRcdG1hcCA9IG1ha2VNb2R1bGVNYXAoZGVwcywgcmVsTWFwLCBmYWxzZSwgdHJ1ZSk7XG5cdFx0XHRcdFx0XHRcdGlkID0gbWFwLmlkO1xuXG5cdFx0XHRcdFx0XHRcdGlmICghaGFzUHJvcChkZWZpbmVkLCBpZCkpIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb25FcnJvcihtYWtlRXJyb3IoJ25vdGxvYWRlZCcsICdNb2R1bGUgbmFtZSBcIicgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGlkICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQnXCIgaGFzIG5vdCBiZWVuIGxvYWRlZCB5ZXQgZm9yIGNvbnRleHQ6ICcgK1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdGNvbnRleHROYW1lICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHQocmVsTWFwID8gJycgOiAnLiBVc2UgcmVxdWlyZShbXSknKSkpO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdHJldHVybiBkZWZpbmVkW2lkXTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9HcmFiIGRlZmluZXMgd2FpdGluZyBpbiB0aGUgZ2xvYmFsIHF1ZXVlLlxuXHRcdFx0XHRcdFx0aW50YWtlRGVmaW5lcygpO1xuXG5cdFx0XHRcdFx0XHQvL01hcmsgYWxsIHRoZSBkZXBlbmRlbmNpZXMgYXMgbmVlZGluZyB0byBiZSBsb2FkZWQuXG5cdFx0XHRcdFx0XHRjb250ZXh0Lm5leHRUaWNrKGZ1bmN0aW9uICgpIHtcblx0XHRcdFx0XHRcdFx0Ly9Tb21lIGRlZmluZXMgY291bGQgaGF2ZSBiZWVuIGFkZGVkIHNpbmNlIHRoZVxuXHRcdFx0XHRcdFx0XHQvL3JlcXVpcmUgY2FsbCwgY29sbGVjdCB0aGVtLlxuXHRcdFx0XHRcdFx0XHRpbnRha2VEZWZpbmVzKCk7XG5cblx0XHRcdFx0XHRcdFx0cmVxdWlyZU1vZCA9IGdldE1vZHVsZShtYWtlTW9kdWxlTWFwKG51bGwsIHJlbE1hcCkpO1xuXG5cdFx0XHRcdFx0XHRcdC8vU3RvcmUgaWYgbWFwIGNvbmZpZyBzaG91bGQgYmUgYXBwbGllZCB0byB0aGlzIHJlcXVpcmVcblx0XHRcdFx0XHRcdFx0Ly9jYWxsIGZvciBkZXBlbmRlbmNpZXMuXG5cdFx0XHRcdFx0XHRcdHJlcXVpcmVNb2Quc2tpcE1hcCA9IG9wdGlvbnMuc2tpcE1hcDtcblxuXHRcdFx0XHRcdFx0XHRyZXF1aXJlTW9kLmluaXQoZGVwcywgY2FsbGJhY2ssIGVycmJhY2ssIHtcblx0XHRcdFx0XHRcdFx0XHRlbmFibGVkOiB0cnVlXG5cdFx0XHRcdFx0XHRcdH0pO1xuXG5cdFx0XHRcdFx0XHRcdGNoZWNrTG9hZGVkKCk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdFx0cmV0dXJuIGxvY2FsUmVxdWlyZTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRtaXhpbihsb2NhbFJlcXVpcmUsIHtcblx0XHRcdFx0XHRcdGlzQnJvd3NlcjogaXNCcm93c2VyLFxuXG5cdFx0XHRcdFx0XHQvKipcblx0XHRcdFx0XHRcdCAqIENvbnZlcnRzIGEgbW9kdWxlIG5hbWUgKyAuZXh0ZW5zaW9uIGludG8gYW4gVVJMIHBhdGguXG5cdFx0XHRcdFx0XHQgKiAqUmVxdWlyZXMqIHRoZSB1c2Ugb2YgYSBtb2R1bGUgbmFtZS4gSXQgZG9lcyBub3Qgc3VwcG9ydCB1c2luZ1xuXHRcdFx0XHRcdFx0ICogcGxhaW4gVVJMcyBsaWtlIG5hbWVUb1VybC5cblx0XHRcdFx0XHRcdCAqL1xuXHRcdFx0XHRcdFx0dG9Vcmw6IGZ1bmN0aW9uIChtb2R1bGVOYW1lUGx1c0V4dCkge1xuXHRcdFx0XHRcdFx0XHR2YXIgZXh0LFxuXHRcdFx0XHRcdFx0XHRcdGluZGV4ID0gbW9kdWxlTmFtZVBsdXNFeHQubGFzdEluZGV4T2YoJy4nKSxcblx0XHRcdFx0XHRcdFx0XHRzZWdtZW50ID0gbW9kdWxlTmFtZVBsdXNFeHQuc3BsaXQoJy8nKVswXSxcblx0XHRcdFx0XHRcdFx0XHRpc1JlbGF0aXZlID0gc2VnbWVudCA9PT0gJy4nIHx8IHNlZ21lbnQgPT09ICcuLic7XG5cblx0XHRcdFx0XHRcdFx0Ly9IYXZlIGEgZmlsZSBleHRlbnNpb24gYWxpYXMsIGFuZCBpdCBpcyBub3QgdGhlXG5cdFx0XHRcdFx0XHRcdC8vZG90cyBmcm9tIGEgcmVsYXRpdmUgcGF0aC5cblx0XHRcdFx0XHRcdFx0aWYgKGluZGV4ICE9PSAtMSAmJiAoIWlzUmVsYXRpdmUgfHwgaW5kZXggPiAxKSkge1xuXHRcdFx0XHRcdFx0XHRcdGV4dCA9IG1vZHVsZU5hbWVQbHVzRXh0LnN1YnN0cmluZyhpbmRleCwgbW9kdWxlTmFtZVBsdXNFeHQubGVuZ3RoKTtcblx0XHRcdFx0XHRcdFx0XHRtb2R1bGVOYW1lUGx1c0V4dCA9IG1vZHVsZU5hbWVQbHVzRXh0LnN1YnN0cmluZygwLCBpbmRleCk7XG5cdFx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0XHRyZXR1cm4gY29udGV4dC5uYW1lVG9Vcmwobm9ybWFsaXplKG1vZHVsZU5hbWVQbHVzRXh0LFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHRyZWxNYXAgJiYgcmVsTWFwLmlkLCB0cnVlKSwgZXh0LCAgdHJ1ZSk7XG5cdFx0XHRcdFx0XHR9LFxuXG5cdFx0XHRcdFx0XHRkZWZpbmVkOiBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGhhc1Byb3AoZGVmaW5lZCwgbWFrZU1vZHVsZU1hcChpZCwgcmVsTWFwLCBmYWxzZSwgdHJ1ZSkuaWQpO1xuXHRcdFx0XHRcdFx0fSxcblxuXHRcdFx0XHRcdFx0c3BlY2lmaWVkOiBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdFx0XHRcdFx0aWQgPSBtYWtlTW9kdWxlTWFwKGlkLCByZWxNYXAsIGZhbHNlLCB0cnVlKS5pZDtcblx0XHRcdFx0XHRcdFx0cmV0dXJuIGhhc1Byb3AoZGVmaW5lZCwgaWQpIHx8IGhhc1Byb3AocmVnaXN0cnksIGlkKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vT25seSBhbGxvdyB1bmRlZiBvbiB0b3AgbGV2ZWwgcmVxdWlyZSBjYWxsc1xuXHRcdFx0XHRcdGlmICghcmVsTWFwKSB7XG5cdFx0XHRcdFx0XHRsb2NhbFJlcXVpcmUudW5kZWYgPSBmdW5jdGlvbiAoaWQpIHtcblx0XHRcdFx0XHRcdFx0Ly9CaW5kIGFueSB3YWl0aW5nIGRlZmluZSgpIGNhbGxzIHRvIHRoaXMgY29udGV4dCxcblx0XHRcdFx0XHRcdFx0Ly9maXggZm9yICM0MDhcblx0XHRcdFx0XHRcdFx0dGFrZUdsb2JhbFF1ZXVlKCk7XG5cblx0XHRcdFx0XHRcdFx0dmFyIG1hcCA9IG1ha2VNb2R1bGVNYXAoaWQsIHJlbE1hcCwgdHJ1ZSksXG5cdFx0XHRcdFx0XHRcdFx0bW9kID0gZ2V0T3duKHJlZ2lzdHJ5LCBpZCk7XG5cblx0XHRcdFx0XHRcdFx0bW9kLnVuZGVmZWQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0XHRyZW1vdmVTY3JpcHQoaWQpO1xuXG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBkZWZpbmVkW2lkXTtcblx0XHRcdFx0XHRcdFx0ZGVsZXRlIHVybEZldGNoZWRbbWFwLnVybF07XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSB1bmRlZkV2ZW50c1tpZF07XG5cblx0XHRcdFx0XHRcdFx0Ly9DbGVhbiBxdWV1ZWQgZGVmaW5lcyB0b28uIEdvIGJhY2t3YXJkc1xuXHRcdFx0XHRcdFx0XHQvL2luIGFycmF5IHNvIHRoYXQgdGhlIHNwbGljZXMgZG8gbm90XG5cdFx0XHRcdFx0XHRcdC8vbWVzcyB1cCB0aGUgaXRlcmF0aW9uLlxuXHRcdFx0XHRcdFx0XHRlYWNoUmV2ZXJzZShkZWZRdWV1ZSwgZnVuY3Rpb24oYXJncywgaSkge1xuXHRcdFx0XHRcdFx0XHRcdGlmIChhcmdzWzBdID09PSBpZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0ZGVmUXVldWUuc3BsaWNlKGksIDEpO1xuXHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRcdGRlbGV0ZSBjb250ZXh0LmRlZlF1ZXVlTWFwW2lkXTtcblxuXHRcdFx0XHRcdFx0XHRpZiAobW9kKSB7XG5cdFx0XHRcdFx0XHRcdFx0Ly9Ib2xkIG9uIHRvIGxpc3RlbmVycyBpbiBjYXNlIHRoZVxuXHRcdFx0XHRcdFx0XHRcdC8vbW9kdWxlIHdpbGwgYmUgYXR0ZW1wdGVkIHRvIGJlIHJlbG9hZGVkXG5cdFx0XHRcdFx0XHRcdFx0Ly91c2luZyBhIGRpZmZlcmVudCBjb25maWcuXG5cdFx0XHRcdFx0XHRcdFx0aWYgKG1vZC5ldmVudHMuZGVmaW5lZCkge1xuXHRcdFx0XHRcdFx0XHRcdFx0dW5kZWZFdmVudHNbaWRdID0gbW9kLmV2ZW50cztcblx0XHRcdFx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRcdFx0XHRjbGVhblJlZ2lzdHJ5KGlkKTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fTtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gbG9jYWxSZXF1aXJlO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBDYWxsZWQgdG8gZW5hYmxlIGEgbW9kdWxlIGlmIGl0IGlzIHN0aWxsIGluIHRoZSByZWdpc3RyeVxuXHRcdFx0XHQgKiBhd2FpdGluZyBlbmFibGVtZW50LiBBIHNlY29uZCBhcmcsIHBhcmVudCwgdGhlIHBhcmVudCBtb2R1bGUsXG5cdFx0XHRcdCAqIGlzIHBhc3NlZCBpbiBmb3IgY29udGV4dCwgd2hlbiB0aGlzIG1ldGhvZCBpcyBvdmVycmlkZGVuIGJ5XG5cdFx0XHRcdCAqIHRoZSBvcHRpbWl6ZXIuIE5vdCBzaG93biBoZXJlIHRvIGtlZXAgY29kZSBjb21wYWN0LlxuXHRcdFx0XHQgKi9cblx0XHRcdFx0ZW5hYmxlOiBmdW5jdGlvbiAoZGVwTWFwKSB7XG5cdFx0XHRcdFx0dmFyIG1vZCA9IGdldE93bihyZWdpc3RyeSwgZGVwTWFwLmlkKTtcblx0XHRcdFx0XHRpZiAobW9kKSB7XG5cdFx0XHRcdFx0XHRnZXRNb2R1bGUoZGVwTWFwKS5lbmFibGUoKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIEludGVybmFsIG1ldGhvZCB1c2VkIGJ5IGVudmlyb25tZW50IGFkYXB0ZXJzIHRvIGNvbXBsZXRlIGEgbG9hZCBldmVudC5cblx0XHRcdFx0ICogQSBsb2FkIGV2ZW50IGNvdWxkIGJlIGEgc2NyaXB0IGxvYWQgb3IganVzdCBhIGxvYWQgcGFzcyBmcm9tIGEgc3luY2hyb25vdXNcblx0XHRcdFx0ICogbG9hZCBjYWxsLlxuXHRcdFx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbW9kdWxlTmFtZSB0aGUgbmFtZSBvZiB0aGUgbW9kdWxlIHRvIHBvdGVudGlhbGx5IGNvbXBsZXRlLlxuXHRcdFx0XHQgKi9cblx0XHRcdFx0Y29tcGxldGVMb2FkOiBmdW5jdGlvbiAobW9kdWxlTmFtZSkge1xuXHRcdFx0XHRcdHZhciBmb3VuZCwgYXJncywgbW9kLFxuXHRcdFx0XHRcdFx0c2hpbSA9IGdldE93bihjb25maWcuc2hpbSwgbW9kdWxlTmFtZSkgfHwge30sXG5cdFx0XHRcdFx0XHRzaEV4cG9ydHMgPSBzaGltLmV4cG9ydHM7XG5cblx0XHRcdFx0XHR0YWtlR2xvYmFsUXVldWUoKTtcblxuXHRcdFx0XHRcdHdoaWxlIChkZWZRdWV1ZS5sZW5ndGgpIHtcblx0XHRcdFx0XHRcdGFyZ3MgPSBkZWZRdWV1ZS5zaGlmdCgpO1xuXHRcdFx0XHRcdFx0aWYgKGFyZ3NbMF0gPT09IG51bGwpIHtcblx0XHRcdFx0XHRcdFx0YXJnc1swXSA9IG1vZHVsZU5hbWU7XG5cdFx0XHRcdFx0XHRcdC8vSWYgYWxyZWFkeSBmb3VuZCBhbiBhbm9ueW1vdXMgbW9kdWxlIGFuZCBib3VuZCBpdFxuXHRcdFx0XHRcdFx0XHQvL3RvIHRoaXMgbmFtZSwgdGhlbiB0aGlzIGlzIHNvbWUgb3RoZXIgYW5vbiBtb2R1bGVcblx0XHRcdFx0XHRcdFx0Ly93YWl0aW5nIGZvciBpdHMgY29tcGxldGVMb2FkIHRvIGZpcmUuXG5cdFx0XHRcdFx0XHRcdGlmIChmb3VuZCkge1xuXHRcdFx0XHRcdFx0XHRcdGJyZWFrO1xuXHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdGZvdW5kID0gdHJ1ZTtcblx0XHRcdFx0XHRcdH0gZWxzZSBpZiAoYXJnc1swXSA9PT0gbW9kdWxlTmFtZSkge1xuXHRcdFx0XHRcdFx0XHQvL0ZvdW5kIG1hdGNoaW5nIGRlZmluZSBjYWxsIGZvciB0aGlzIHNjcmlwdCFcblx0XHRcdFx0XHRcdFx0Zm91bmQgPSB0cnVlO1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHRjYWxsR2V0TW9kdWxlKGFyZ3MpO1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0XHRjb250ZXh0LmRlZlF1ZXVlTWFwID0ge307XG5cblx0XHRcdFx0XHQvL0RvIHRoaXMgYWZ0ZXIgdGhlIGN5Y2xlIG9mIGNhbGxHZXRNb2R1bGUgaW4gY2FzZSB0aGUgcmVzdWx0XG5cdFx0XHRcdFx0Ly9vZiB0aG9zZSBjYWxscy9pbml0IGNhbGxzIGNoYW5nZXMgdGhlIHJlZ2lzdHJ5LlxuXHRcdFx0XHRcdG1vZCA9IGdldE93bihyZWdpc3RyeSwgbW9kdWxlTmFtZSk7XG5cblx0XHRcdFx0XHRpZiAoIWZvdW5kICYmICFoYXNQcm9wKGRlZmluZWQsIG1vZHVsZU5hbWUpICYmIG1vZCAmJiAhbW9kLmluaXRlZCkge1xuXHRcdFx0XHRcdFx0aWYgKGNvbmZpZy5lbmZvcmNlRGVmaW5lICYmICghc2hFeHBvcnRzIHx8ICFnZXRHbG9iYWwoc2hFeHBvcnRzKSkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGhhc1BhdGhGYWxsYmFjayhtb2R1bGVOYW1lKSkge1xuXHRcdFx0XHRcdFx0XHRcdHJldHVybjtcblx0XHRcdFx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gb25FcnJvcihtYWtlRXJyb3IoJ25vZGVmaW5lJyxcblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCAnTm8gZGVmaW5lIGNhbGwgZm9yICcgKyBtb2R1bGVOYW1lLFxuXHRcdFx0XHRcdFx0XHRcdFx0XHRcdFx0IG51bGwsXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgW21vZHVsZU5hbWVdKSk7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdC8vQSBzY3JpcHQgdGhhdCBkb2VzIG5vdCBjYWxsIGRlZmluZSgpLCBzbyBqdXN0IHNpbXVsYXRlXG5cdFx0XHRcdFx0XHRcdC8vdGhlIGNhbGwgZm9yIGl0LlxuXHRcdFx0XHRcdFx0XHRjYWxsR2V0TW9kdWxlKFttb2R1bGVOYW1lLCAoc2hpbS5kZXBzIHx8IFtdKSwgc2hpbS5leHBvcnRzRm5dKTtcblx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRjaGVja0xvYWRlZCgpO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBDb252ZXJ0cyBhIG1vZHVsZSBuYW1lIHRvIGEgZmlsZSBwYXRoLiBTdXBwb3J0cyBjYXNlcyB3aGVyZVxuXHRcdFx0XHQgKiBtb2R1bGVOYW1lIG1heSBhY3R1YWxseSBiZSBqdXN0IGFuIFVSTC5cblx0XHRcdFx0ICogTm90ZSB0aGF0IGl0ICoqZG9lcyBub3QqKiBjYWxsIG5vcm1hbGl6ZSBvbiB0aGUgbW9kdWxlTmFtZSxcblx0XHRcdFx0ICogaXQgaXMgYXNzdW1lZCB0byBoYXZlIGFscmVhZHkgYmVlbiBub3JtYWxpemVkLiBUaGlzIGlzIGFuXG5cdFx0XHRcdCAqIGludGVybmFsIEFQSSwgbm90IGEgcHVibGljIG9uZS4gVXNlIHRvVXJsIGZvciB0aGUgcHVibGljIEFQSS5cblx0XHRcdFx0ICovXG5cdFx0XHRcdG5hbWVUb1VybDogZnVuY3Rpb24gKG1vZHVsZU5hbWUsIGV4dCwgc2tpcEV4dCkge1xuXHRcdFx0XHRcdHZhciBwYXRocywgc3ltcywgaSwgcGFyZW50TW9kdWxlLCB1cmwsXG5cdFx0XHRcdFx0XHRwYXJlbnRQYXRoLCBidW5kbGVJZCxcblx0XHRcdFx0XHRcdHBrZ01haW4gPSBnZXRPd24oY29uZmlnLnBrZ3MsIG1vZHVsZU5hbWUpO1xuXG5cdFx0XHRcdFx0aWYgKHBrZ01haW4pIHtcblx0XHRcdFx0XHRcdG1vZHVsZU5hbWUgPSBwa2dNYWluO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdGJ1bmRsZUlkID0gZ2V0T3duKGJ1bmRsZXNNYXAsIG1vZHVsZU5hbWUpO1xuXG5cdFx0XHRcdFx0aWYgKGJ1bmRsZUlkKSB7XG5cdFx0XHRcdFx0XHRyZXR1cm4gY29udGV4dC5uYW1lVG9VcmwoYnVuZGxlSWQsIGV4dCwgc2tpcEV4dCk7XG5cdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0Ly9JZiBhIGNvbG9uIGlzIGluIHRoZSBVUkwsIGl0IGluZGljYXRlcyBhIHByb3RvY29sIGlzIHVzZWQgYW5kIGl0IGlzIGp1c3Rcblx0XHRcdFx0XHQvL2FuIFVSTCB0byBhIGZpbGUsIG9yIGlmIGl0IHN0YXJ0cyB3aXRoIGEgc2xhc2gsIGNvbnRhaW5zIGEgcXVlcnkgYXJnIChpLmUuID8pXG5cdFx0XHRcdFx0Ly9vciBlbmRzIHdpdGggLmpzLCB0aGVuIGFzc3VtZSB0aGUgdXNlciBtZWFudCB0byB1c2UgYW4gdXJsIGFuZCBub3QgYSBtb2R1bGUgaWQuXG5cdFx0XHRcdFx0Ly9UaGUgc2xhc2ggaXMgaW1wb3J0YW50IGZvciBwcm90b2NvbC1sZXNzIFVSTHMgYXMgd2VsbCBhcyBmdWxsIHBhdGhzLlxuXHRcdFx0XHRcdGlmIChyZXEuanNFeHRSZWdFeHAudGVzdChtb2R1bGVOYW1lKSkge1xuXHRcdFx0XHRcdFx0Ly9KdXN0IGEgcGxhaW4gcGF0aCwgbm90IG1vZHVsZSBuYW1lIGxvb2t1cCwgc28ganVzdCByZXR1cm4gaXQuXG5cdFx0XHRcdFx0XHQvL0FkZCBleHRlbnNpb24gaWYgaXQgaXMgaW5jbHVkZWQuIFRoaXMgaXMgYSBiaXQgd29ua3ksIG9ubHkgbm9uLS5qcyB0aGluZ3MgcGFzc1xuXHRcdFx0XHRcdFx0Ly9hbiBleHRlbnNpb24sIHRoaXMgbWV0aG9kIHByb2JhYmx5IG5lZWRzIHRvIGJlIHJld29ya2VkLlxuXHRcdFx0XHRcdFx0dXJsID0gbW9kdWxlTmFtZSArIChleHQgfHwgJycpO1xuXHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHQvL0EgbW9kdWxlIHRoYXQgbmVlZHMgdG8gYmUgY29udmVydGVkIHRvIGEgcGF0aC5cblx0XHRcdFx0XHRcdHBhdGhzID0gY29uZmlnLnBhdGhzO1xuXG5cdFx0XHRcdFx0XHRzeW1zID0gbW9kdWxlTmFtZS5zcGxpdCgnLycpO1xuXHRcdFx0XHRcdFx0Ly9Gb3IgZWFjaCBtb2R1bGUgbmFtZSBzZWdtZW50LCBzZWUgaWYgdGhlcmUgaXMgYSBwYXRoXG5cdFx0XHRcdFx0XHQvL3JlZ2lzdGVyZWQgZm9yIGl0LiBTdGFydCB3aXRoIG1vc3Qgc3BlY2lmaWMgbmFtZVxuXHRcdFx0XHRcdFx0Ly9hbmQgd29yayB1cCBmcm9tIGl0LlxuXHRcdFx0XHRcdFx0Zm9yIChpID0gc3ltcy5sZW5ndGg7IGkgPiAwOyBpIC09IDEpIHtcblx0XHRcdFx0XHRcdFx0cGFyZW50TW9kdWxlID0gc3ltcy5zbGljZSgwLCBpKS5qb2luKCcvJyk7XG5cblx0XHRcdFx0XHRcdFx0cGFyZW50UGF0aCA9IGdldE93bihwYXRocywgcGFyZW50TW9kdWxlKTtcblx0XHRcdFx0XHRcdFx0aWYgKHBhcmVudFBhdGgpIHtcblx0XHRcdFx0XHRcdFx0XHQvL0lmIGFuIGFycmF5LCBpdCBtZWFucyB0aGVyZSBhcmUgYSBmZXcgY2hvaWNlcyxcblx0XHRcdFx0XHRcdFx0XHQvL0Nob29zZSB0aGUgb25lIHRoYXQgaXMgZGVzaXJlZFxuXHRcdFx0XHRcdFx0XHRcdGlmIChpc0FycmF5KHBhcmVudFBhdGgpKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRwYXJlbnRQYXRoID0gcGFyZW50UGF0aFswXTtcblx0XHRcdFx0XHRcdFx0XHR9XG5cdFx0XHRcdFx0XHRcdFx0c3ltcy5zcGxpY2UoMCwgaSwgcGFyZW50UGF0aCk7XG5cdFx0XHRcdFx0XHRcdFx0YnJlYWs7XG5cdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly9Kb2luIHRoZSBwYXRoIHBhcnRzIHRvZ2V0aGVyLCB0aGVuIGZpZ3VyZSBvdXQgaWYgYmFzZVVybCBpcyBuZWVkZWQuXG5cdFx0XHRcdFx0XHR1cmwgPSBzeW1zLmpvaW4oJy8nKTtcblx0XHRcdFx0XHRcdHVybCArPSAoZXh0IHx8ICgvXmRhdGFcXFxcOnxeYmxvYlxcXFw6fFxcXFw/Ly50ZXN0KHVybCkgfHwgc2tpcEV4dCA/ICcnIDogJy5qcycpKTtcblx0XHRcdFx0XHRcdHVybCA9ICh1cmwuY2hhckF0KDApID09PSAnLycgfHwgdXJsLm1hdGNoKC9eW1xcXFx3XFxcXCtcXFxcLlxcXFwtXSs6LykgPyAnJyA6IGNvbmZpZy5iYXNlVXJsKSArIHVybDtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHRyZXR1cm4gY29uZmlnLnVybEFyZ3MgJiYgIS9eYmxvYlxcXFw6Ly50ZXN0KHVybCkgP1xuXHRcdFx0XHRcdFx0ICAgdXJsICsgY29uZmlnLnVybEFyZ3MobW9kdWxlTmFtZSwgdXJsKSA6IHVybDtcblx0XHRcdFx0fSxcblxuXHRcdFx0XHQvL0RlbGVnYXRlcyB0byByZXEubG9hZC4gQnJva2VuIG91dCBhcyBhIHNlcGFyYXRlIGZ1bmN0aW9uIHRvXG5cdFx0XHRcdC8vYWxsb3cgb3ZlcnJpZGluZyBpbiB0aGUgb3B0aW1pemVyLlxuXHRcdFx0XHRsb2FkOiBmdW5jdGlvbiAoaWQsIHVybCkge1xuXHRcdFx0XHRcdHJlcS5sb2FkKGNvbnRleHQsIGlkLCB1cmwpO1xuXHRcdFx0XHR9LFxuXG5cdFx0XHRcdC8qKlxuXHRcdFx0XHQgKiBFeGVjdXRlcyBhIG1vZHVsZSBjYWxsYmFjayBmdW5jdGlvbi4gQnJva2VuIG91dCBhcyBhIHNlcGFyYXRlIGZ1bmN0aW9uXG5cdFx0XHRcdCAqIHNvbGVseSB0byBhbGxvdyB0aGUgYnVpbGQgc3lzdGVtIHRvIHNlcXVlbmNlIHRoZSBmaWxlcyBpbiB0aGUgYnVpbHRcblx0XHRcdFx0ICogbGF5ZXIgaW4gdGhlIHJpZ2h0IHNlcXVlbmNlLlxuXHRcdFx0XHQgKlxuXHRcdFx0XHQgKiBAcHJpdmF0ZVxuXHRcdFx0XHQgKi9cblx0XHRcdFx0ZXhlY0NiOiBmdW5jdGlvbiAobmFtZSwgY2FsbGJhY2ssIGFyZ3MsIGV4cG9ydHMpIHtcblx0XHRcdFx0XHRyZXR1cm4gY2FsbGJhY2suYXBwbHkoZXhwb3J0cywgYXJncyk7XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIGNhbGxiYWNrIGZvciBzY3JpcHQgbG9hZHMsIHVzZWQgdG8gY2hlY2sgc3RhdHVzIG9mIGxvYWRpbmcuXG5cdFx0XHRcdCAqXG5cdFx0XHRcdCAqIEBwYXJhbSB7RXZlbnR9IGV2dCB0aGUgZXZlbnQgZnJvbSB0aGUgYnJvd3NlciBmb3IgdGhlIHNjcmlwdFxuXHRcdFx0XHQgKiB0aGF0IHdhcyBsb2FkZWQuXG5cdFx0XHRcdCAqL1xuXHRcdFx0XHRvblNjcmlwdExvYWQ6IGZ1bmN0aW9uIChldnQpIHtcblx0XHRcdFx0XHQvL1VzaW5nIGN1cnJlbnRUYXJnZXQgaW5zdGVhZCBvZiB0YXJnZXQgZm9yIEZpcmVmb3ggMi4wJ3Mgc2FrZS4gTm90XG5cdFx0XHRcdFx0Ly9hbGwgb2xkIGJyb3dzZXJzIHdpbGwgYmUgc3VwcG9ydGVkLCBidXQgdGhpcyBvbmUgd2FzIGVhc3kgZW5vdWdoXG5cdFx0XHRcdFx0Ly90byBzdXBwb3J0IGFuZCBzdGlsbCBtYWtlcyBzZW5zZS5cblx0XHRcdFx0XHRpZiAoZXZ0LnR5cGUgPT09ICdsb2FkJyB8fFxuXHRcdFx0XHRcdFx0XHQocmVhZHlSZWdFeHAudGVzdCgoZXZ0LmN1cnJlbnRUYXJnZXQgfHwgZXZ0LnNyY0VsZW1lbnQpLnJlYWR5U3RhdGUpKSkge1xuXHRcdFx0XHRcdFx0Ly9SZXNldCBpbnRlcmFjdGl2ZSBzY3JpcHQgc28gYSBzY3JpcHQgbm9kZSBpcyBub3QgaGVsZCBvbnRvIGZvclxuXHRcdFx0XHRcdFx0Ly90byBsb25nLlxuXHRcdFx0XHRcdFx0aW50ZXJhY3RpdmVTY3JpcHQgPSBudWxsO1xuXG5cdFx0XHRcdFx0XHQvL1B1bGwgb3V0IHRoZSBuYW1lIG9mIHRoZSBtb2R1bGUgYW5kIHRoZSBjb250ZXh0LlxuXHRcdFx0XHRcdFx0dmFyIGRhdGEgPSBnZXRTY3JpcHREYXRhKGV2dCk7XG5cdFx0XHRcdFx0XHRjb250ZXh0LmNvbXBsZXRlTG9hZChkYXRhLmlkKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH0sXG5cblx0XHRcdFx0LyoqXG5cdFx0XHRcdCAqIENhbGxiYWNrIGZvciBzY3JpcHQgZXJyb3JzLlxuXHRcdFx0XHQgKi9cblx0XHRcdFx0b25TY3JpcHRFcnJvcjogZnVuY3Rpb24gKGV2dCkge1xuXHRcdFx0XHRcdHZhciBkYXRhID0gZ2V0U2NyaXB0RGF0YShldnQpO1xuXHRcdFx0XHRcdGlmICghaGFzUGF0aEZhbGxiYWNrKGRhdGEuaWQpKSB7XG5cdFx0XHRcdFx0XHR2YXIgcGFyZW50cyA9IFtdO1xuXHRcdFx0XHRcdFx0ZWFjaFByb3AocmVnaXN0cnksIGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcblx0XHRcdFx0XHRcdFx0aWYgKGtleS5pbmRleE9mKCdfQHInKSAhPT0gMCkge1xuXHRcdFx0XHRcdFx0XHRcdGVhY2godmFsdWUuZGVwTWFwcywgZnVuY3Rpb24oZGVwTWFwKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRpZiAoZGVwTWFwLmlkID09PSBkYXRhLmlkKSB7XG5cdFx0XHRcdFx0XHRcdFx0XHRcdHBhcmVudHMucHVzaChrZXkpO1xuXHRcdFx0XHRcdFx0XHRcdFx0XHRyZXR1cm4gdHJ1ZTtcblx0XHRcdFx0XHRcdFx0XHRcdH1cblx0XHRcdFx0XHRcdFx0XHR9KTtcblx0XHRcdFx0XHRcdFx0fVxuXHRcdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0XHRyZXR1cm4gb25FcnJvcihtYWtlRXJyb3IoJ3NjcmlwdGVycm9yJywgJ1NjcmlwdCBlcnJvciBmb3IgXCInICsgZGF0YS5pZCArXG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgKHBhcmVudHMubGVuZ3RoID9cblx0XHRcdFx0XHRcdFx0XHRcdFx0XHRcdCAnXCIsIG5lZWRlZCBieTogJyArIHBhcmVudHMuam9pbignLCAnKSA6XG5cdFx0XHRcdFx0XHRcdFx0XHRcdFx0XHQgJ1wiJyksIGV2dCwgW2RhdGEuaWRdKSk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9O1xuXG5cdFx0XHRjb250ZXh0LnJlcXVpcmUgPSBjb250ZXh0Lm1ha2VSZXF1aXJlKCk7XG5cdFx0XHRyZXR1cm4gY29udGV4dDtcblx0XHR9XG5cblx0XHQvKipcblx0XHQgKiBNYWluIGVudHJ5IHBvaW50LlxuXHRcdCAqXG5cdFx0ICogSWYgdGhlIG9ubHkgYXJndW1lbnQgdG8gcmVxdWlyZSBpcyBhIHN0cmluZywgdGhlbiB0aGUgbW9kdWxlIHRoYXRcblx0XHQgKiBpcyByZXByZXNlbnRlZCBieSB0aGF0IHN0cmluZyBpcyBmZXRjaGVkIGZvciB0aGUgYXBwcm9wcmlhdGUgY29udGV4dC5cblx0XHQgKlxuXHRcdCAqIElmIHRoZSBmaXJzdCBhcmd1bWVudCBpcyBhbiBhcnJheSwgdGhlbiBpdCB3aWxsIGJlIHRyZWF0ZWQgYXMgYW4gYXJyYXlcblx0XHQgKiBvZiBkZXBlbmRlbmN5IHN0cmluZyBuYW1lcyB0byBmZXRjaC4gQW4gb3B0aW9uYWwgZnVuY3Rpb24gY2FsbGJhY2sgY2FuXG5cdFx0ICogYmUgc3BlY2lmaWVkIHRvIGV4ZWN1dGUgd2hlbiBhbGwgb2YgdGhvc2UgZGVwZW5kZW5jaWVzIGFyZSBhdmFpbGFibGUuXG5cdFx0ICpcblx0XHQgKiBNYWtlIGEgbG9jYWwgcmVxIHZhcmlhYmxlIHRvIGhlbHAgQ2FqYSBjb21wbGlhbmNlIChpdCBhc3N1bWVzIHRoaW5nc1xuXHRcdCAqIG9uIGEgcmVxdWlyZSB0aGF0IGFyZSBub3Qgc3RhbmRhcmRpemVkKSwgYW5kIHRvIGdpdmUgYSBzaG9ydFxuXHRcdCAqIG5hbWUgZm9yIG1pbmlmaWNhdGlvbi9sb2NhbCBzY29wZSB1c2UuXG5cdFx0ICovXG5cdFx0cmVxID0gd2luZG93LnJlcXVpcmVqcyA9IGZ1bmN0aW9uIChkZXBzLCBjYWxsYmFjaywgZXJyYmFjaywgb3B0aW9uYWwpIHtcblxuXHRcdFx0Ly9GaW5kIHRoZSByaWdodCBjb250ZXh0LCB1c2UgZGVmYXVsdFxuXHRcdFx0dmFyIGNvbnRleHQsIGNvbmZpZyxcblx0XHRcdFx0Y29udGV4dE5hbWUgPSBkZWZDb250ZXh0TmFtZTtcblxuXHRcdFx0Ly8gRGV0ZXJtaW5lIGlmIGhhdmUgY29uZmlnIG9iamVjdCBpbiB0aGUgY2FsbC5cblx0XHRcdGlmICghaXNBcnJheShkZXBzKSAmJiB0eXBlb2YgZGVwcyAhPT0gJ3N0cmluZycpIHtcblx0XHRcdFx0Ly8gZGVwcyBpcyBhIGNvbmZpZyBvYmplY3Rcblx0XHRcdFx0Y29uZmlnID0gZGVwcztcblx0XHRcdFx0aWYgKGlzQXJyYXkoY2FsbGJhY2spKSB7XG5cdFx0XHRcdFx0Ly8gQWRqdXN0IGFyZ3MgaWYgdGhlcmUgYXJlIGRlcGVuZGVuY2llc1xuXHRcdFx0XHRcdGRlcHMgPSBjYWxsYmFjaztcblx0XHRcdFx0XHRjYWxsYmFjayA9IGVycmJhY2s7XG5cdFx0XHRcdFx0ZXJyYmFjayA9IG9wdGlvbmFsO1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGRlcHMgPSBbXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHRpZiAoY29uZmlnICYmIGNvbmZpZy5jb250ZXh0KSB7XG5cdFx0XHRcdGNvbnRleHROYW1lID0gY29uZmlnLmNvbnRleHQ7XG5cdFx0XHR9XG5cblx0XHRcdGNvbnRleHQgPSBnZXRPd24oY29udGV4dHMsIGNvbnRleHROYW1lKTtcblx0XHRcdGlmICghY29udGV4dCkge1xuXHRcdFx0XHRjb250ZXh0ID0gY29udGV4dHNbY29udGV4dE5hbWVdID0gcmVxLnMubmV3Q29udGV4dChjb250ZXh0TmFtZSk7XG5cdFx0XHR9XG5cblx0XHRcdGlmIChjb25maWcpIHtcblx0XHRcdFx0Y29udGV4dC5jb25maWd1cmUoY29uZmlnKTtcblx0XHRcdH1cblxuXHRcdFx0cmV0dXJuIGNvbnRleHQucmVxdWlyZShkZXBzLCBjYWxsYmFjaywgZXJyYmFjayk7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIFN1cHBvcnQgcmVxdWlyZS5jb25maWcoKSB0byBtYWtlIGl0IGVhc2llciB0byBjb29wZXJhdGUgd2l0aCBvdGhlclxuXHRcdCAqIEFNRCBsb2FkZXJzIG9uIGdsb2JhbGx5IGFncmVlZCBuYW1lcy5cblx0XHQgKi9cblx0XHRyZXEuY29uZmlnID0gZnVuY3Rpb24gKGNvbmZpZykge1xuXHRcdFx0cmV0dXJuIHJlcShjb25maWcpO1xuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBFeGVjdXRlIHNvbWV0aGluZyBhZnRlciB0aGUgY3VycmVudCB0aWNrXG5cdFx0ICogb2YgdGhlIGV2ZW50IGxvb3AuIE92ZXJyaWRlIGZvciBvdGhlciBlbnZzXG5cdFx0ICogdGhhdCBoYXZlIGEgYmV0dGVyIHNvbHV0aW9uIHRoYW4gc2V0VGltZW91dC5cblx0XHQgKiBAcGFyYW0gIHtGdW5jdGlvbn0gZm4gZnVuY3Rpb24gdG8gZXhlY3V0ZSBsYXRlci5cblx0XHQgKi9cblx0XHRyZXEubmV4dFRpY2sgPSB0eXBlb2Ygc2V0VGltZW91dCAhPT0gJ3VuZGVmaW5lZCcgPyBmdW5jdGlvbiAoZm4pIHtcblx0XHRcdHNldFRpbWVvdXQoZm4sIDQpO1xuXHRcdH0gOiBmdW5jdGlvbiAoZm4pIHsgZm4oKTsgfTtcblxuXHRcdC8qKlxuXHRcdCAqIEV4cG9ydCByZXF1aXJlIGFzIGEgZ2xvYmFsLCBidXQgb25seSBpZiBpdCBkb2VzIG5vdCBhbHJlYWR5IGV4aXN0LlxuXHRcdCAqL1xuXHRcdGlmICghd2luZG93LnJlcXVpcmUpIHtcblx0XHRcdHdpbmRvdy5yZXF1aXJlID0gcmVxO1xuXHRcdH1cblxuXHRcdHJlcS52ZXJzaW9uID0gdmVyc2lvbjtcblxuXHRcdC8vVXNlZCB0byBmaWx0ZXIgb3V0IGRlcGVuZGVuY2llcyB0aGF0IGFyZSBhbHJlYWR5IHBhdGhzLlxuXHRcdHJlcS5qc0V4dFJlZ0V4cCA9IC9eXFxcXC98OnxcXFxcP3xcXFxcLmpzJC87XG5cdFx0cmVxLmlzQnJvd3NlciA9IGlzQnJvd3Nlcjtcblx0XHRzID0gcmVxLnMgPSB7XG5cdFx0XHRjb250ZXh0czogY29udGV4dHMsXG5cdFx0XHRuZXdDb250ZXh0OiBuZXdDb250ZXh0XG5cdFx0fTtcblxuXHRcdC8vQ3JlYXRlIGRlZmF1bHQgY29udGV4dC5cblx0XHRyZXEoe30pO1xuXG5cdFx0Ly9FeHBvcnRzIHNvbWUgY29udGV4dC1zZW5zaXRpdmUgbWV0aG9kcyBvbiBnbG9iYWwgcmVxdWlyZS5cblx0XHRlYWNoKFtcblx0XHRcdCd0b1VybCcsXG5cdFx0XHQndW5kZWYnLFxuXHRcdFx0J2RlZmluZWQnLFxuXHRcdFx0J3NwZWNpZmllZCdcblx0XHRdLCBmdW5jdGlvbiAocHJvcCkge1xuXHRcdFx0Ly9SZWZlcmVuY2UgZnJvbSBjb250ZXh0cyBpbnN0ZWFkIG9mIGVhcmx5IGJpbmRpbmcgdG8gZGVmYXVsdCBjb250ZXh0LFxuXHRcdFx0Ly9zbyB0aGF0IGR1cmluZyBidWlsZHMsIHRoZSBsYXRlc3QgaW5zdGFuY2Ugb2YgdGhlIGRlZmF1bHQgY29udGV4dFxuXHRcdFx0Ly93aXRoIGl0cyBjb25maWcgZ2V0cyB1c2VkLlxuXHRcdFx0cmVxW3Byb3BdID0gZnVuY3Rpb24gKCkge1xuXHRcdFx0XHR2YXIgY3R4ID0gY29udGV4dHNbZGVmQ29udGV4dE5hbWVdO1xuXHRcdFx0XHRyZXR1cm4gY3R4LnJlcXVpcmVbcHJvcF0uYXBwbHkoY3R4LCBhcmd1bWVudHMpO1xuXHRcdFx0fTtcblx0XHR9KTtcblxuXHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdGhlYWQgPSBzLmhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnaGVhZCcpWzBdO1xuXHRcdFx0Ly9JZiBCQVNFIHRhZyBpcyBpbiBwbGF5LCB1c2luZyBhcHBlbmRDaGlsZCBpcyBhIHByb2JsZW0gZm9yIElFNi5cblx0XHRcdC8vV2hlbiB0aGF0IGJyb3dzZXIgZGllcywgdGhpcyBjYW4gYmUgcmVtb3ZlZC4gRGV0YWlscyBpbiB0aGlzIGpRdWVyeSBidWc6XG5cdFx0XHQvL2h0dHA6Ly9kZXYuanF1ZXJ5LmNvbS90aWNrZXQvMjcwOVxuXHRcdFx0YmFzZUVsZW1lbnQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZSgnYmFzZScpWzBdO1xuXHRcdFx0aWYgKGJhc2VFbGVtZW50KSB7XG5cdFx0XHRcdGhlYWQgPSBzLmhlYWQgPSBiYXNlRWxlbWVudC5wYXJlbnROb2RlO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIEFueSBlcnJvcnMgdGhhdCByZXF1aXJlIGV4cGxpY2l0bHkgZ2VuZXJhdGVzIHdpbGwgYmUgcGFzc2VkIHRvIHRoaXNcblx0XHQgKiBmdW5jdGlvbi4gSW50ZXJjZXB0L292ZXJyaWRlIGl0IGlmIHlvdSB3YW50IGN1c3RvbSBlcnJvciBoYW5kbGluZy5cblx0XHQgKiBAcGFyYW0ge0Vycm9yfSBlcnIgdGhlIGVycm9yIG9iamVjdC5cblx0XHQgKi9cblx0XHRyZXEub25FcnJvciA9IGRlZmF1bHRPbkVycm9yO1xuXG5cdFx0LyoqXG5cdFx0ICogQ3JlYXRlcyB0aGUgbm9kZSBmb3IgdGhlIGxvYWQgY29tbWFuZC4gT25seSB1c2VkIGluIGJyb3dzZXIgZW52cy5cblx0XHQgKi9cblx0XHRyZXEuY3JlYXRlTm9kZSA9IGZ1bmN0aW9uIChjb25maWcsIG1vZHVsZU5hbWUsIHVybCkge1xuXHRcdFx0dmFyIG5vZGUgPSBjb25maWcueGh0bWwgP1xuXHRcdFx0XHRcdGRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUygnaHR0cDovL3d3dy53My5vcmcvMTk5OS94aHRtbCcsICdodG1sOnNjcmlwdCcpIDpcblx0XHRcdFx0XHRkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdzY3JpcHQnKTtcblx0XHRcdG5vZGUudHlwZSA9IGNvbmZpZy5zY3JpcHRUeXBlIHx8ICd0ZXh0L2phdmFzY3JpcHQnO1xuXHRcdFx0bm9kZS5jaGFyc2V0ID0gJ3V0Zi04Jztcblx0XHRcdG5vZGUuYXN5bmMgPSB0cnVlO1xuXHRcdFx0cmV0dXJuIG5vZGU7XG5cdFx0fTtcblxuXHRcdC8qKlxuXHRcdCAqIERvZXMgdGhlIHJlcXVlc3QgdG8gbG9hZCBhIG1vZHVsZSBmb3IgdGhlIGJyb3dzZXIgY2FzZS5cblx0XHQgKiBNYWtlIHRoaXMgYSBzZXBhcmF0ZSBmdW5jdGlvbiB0byBhbGxvdyBvdGhlciBlbnZpcm9ubWVudHNcblx0XHQgKiB0byBvdmVycmlkZSBpdC5cblx0XHQgKlxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSBjb250ZXh0IHRoZSByZXF1aXJlIGNvbnRleHQgdG8gZmluZCBzdGF0ZS5cblx0XHQgKiBAcGFyYW0ge1N0cmluZ30gbW9kdWxlTmFtZSB0aGUgbmFtZSBvZiB0aGUgbW9kdWxlLlxuXHRcdCAqIEBwYXJhbSB7T2JqZWN0fSB1cmwgdGhlIFVSTCB0byB0aGUgbW9kdWxlLlxuXHRcdCAqL1xuXHRcdHJlcS5sb2FkID0gZnVuY3Rpb24gKGNvbnRleHQsIG1vZHVsZU5hbWUsIHVybCkge1xuXHRcdFx0dmFyIGNvbmZpZyA9IChjb250ZXh0ICYmIGNvbnRleHQuY29uZmlnKSB8fCB7fSxcblx0XHRcdFx0bm9kZTtcblx0XHRcdGlmIChpc0Jyb3dzZXIpIHtcblx0XHRcdFx0Ly9JbiB0aGUgYnJvd3NlciBzbyB1c2UgYSBzY3JpcHQgdGFnXG5cdFx0XHRcdG5vZGUgPSByZXEuY3JlYXRlTm9kZShjb25maWcsIG1vZHVsZU5hbWUsIHVybCk7XG5cblx0XHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtcmVxdWlyZWNvbnRleHQnLCBjb250ZXh0LmNvbnRleHROYW1lKTtcblx0XHRcdFx0bm9kZS5zZXRBdHRyaWJ1dGUoJ2RhdGEtcmVxdWlyZW1vZHVsZScsIG1vZHVsZU5hbWUpO1xuXG5cdFx0XHRcdC8vU2V0IHVwIGxvYWQgbGlzdGVuZXIuIFRlc3QgYXR0YWNoRXZlbnQgZmlyc3QgYmVjYXVzZSBJRTkgaGFzXG5cdFx0XHRcdC8vYSBzdWJ0bGUgaXNzdWUgaW4gaXRzIGFkZEV2ZW50TGlzdGVuZXIgYW5kIHNjcmlwdCBvbmxvYWQgZmlyaW5nc1xuXHRcdFx0XHQvL3RoYXQgZG8gbm90IG1hdGNoIHRoZSBiZWhhdmlvciBvZiBhbGwgb3RoZXIgYnJvd3NlcnMgd2l0aFxuXHRcdFx0XHQvL2FkZEV2ZW50TGlzdGVuZXIgc3VwcG9ydCwgd2hpY2ggZmlyZSB0aGUgb25sb2FkIGV2ZW50IGZvciBhXG5cdFx0XHRcdC8vc2NyaXB0IHJpZ2h0IGFmdGVyIHRoZSBzY3JpcHQgZXhlY3V0aW9uLiBTZWU6XG5cdFx0XHRcdC8vaHR0cHM6Ly9jb25uZWN0Lm1pY3Jvc29mdC5jb20vSUUvZmVlZGJhY2svZGV0YWlscy82NDgwNTcvc2NyaXB0LW9ubG9hZC1ldmVudC1pcy1ub3QtZmlyZWQtaW1tZWRpYXRlbHktYWZ0ZXItc2NyaXB0LWV4ZWN1dGlvblxuXHRcdFx0XHQvL1VORk9SVFVOQVRFTFkgT3BlcmEgaW1wbGVtZW50cyBhdHRhY2hFdmVudCBidXQgZG9lcyBub3QgZm9sbG93IHRoZSBzY3JpcHRcblx0XHRcdFx0Ly9zY3JpcHQgZXhlY3V0aW9uIG1vZGUuXG5cdFx0XHRcdGlmIChub2RlLmF0dGFjaEV2ZW50ICYmXG5cdFx0XHRcdFx0XHQvL0NoZWNrIGlmIG5vZGUuYXR0YWNoRXZlbnQgaXMgYXJ0aWZpY2lhbGx5IGFkZGVkIGJ5IGN1c3RvbSBzY3JpcHQgb3Jcblx0XHRcdFx0XHRcdC8vbmF0aXZlbHkgc3VwcG9ydGVkIGJ5IGJyb3dzZXJcblx0XHRcdFx0XHRcdC8vcmVhZCBodHRwczovL2dpdGh1Yi5jb20vcmVxdWlyZWpzL3JlcXVpcmVqcy9pc3N1ZXMvMTg3XG5cdFx0XHRcdFx0XHQvL2lmIHdlIGNhbiBOT1QgZmluZCBbbmF0aXZlIGNvZGVdIHRoZW4gaXQgbXVzdCBOT1QgbmF0aXZlbHkgc3VwcG9ydGVkLlxuXHRcdFx0XHRcdFx0Ly9pbiBJRTgsIG5vZGUuYXR0YWNoRXZlbnQgZG9lcyBub3QgaGF2ZSB0b1N0cmluZygpXG5cdFx0XHRcdFx0XHQvL05vdGUgdGhlIHRlc3QgZm9yIFwiW25hdGl2ZSBjb2RlXCIgd2l0aCBubyBjbG9zaW5nIGJyYWNlLCBzZWU6XG5cdFx0XHRcdFx0XHQvL2h0dHBzOi8vZ2l0aHViLmNvbS9yZXF1aXJlanMvcmVxdWlyZWpzL2lzc3Vlcy8yNzNcblx0XHRcdFx0XHRcdCEobm9kZS5hdHRhY2hFdmVudC50b1N0cmluZyAmJiBub2RlLmF0dGFjaEV2ZW50LnRvU3RyaW5nKCkuaW5kZXhPZignW25hdGl2ZSBjb2RlJykgPCAwKSAmJlxuXHRcdFx0XHRcdFx0IWlzT3BlcmEpIHtcblx0XHRcdFx0XHQvL1Byb2JhYmx5IElFLiBJRSAoYXQgbGVhc3QgNi04KSBkbyBub3QgZmlyZVxuXHRcdFx0XHRcdC8vc2NyaXB0IG9ubG9hZCByaWdodCBhZnRlciBleGVjdXRpbmcgdGhlIHNjcmlwdCwgc29cblx0XHRcdFx0XHQvL3dlIGNhbm5vdCB0aWUgdGhlIGFub255bW91cyBkZWZpbmUgY2FsbCB0byBhIG5hbWUuXG5cdFx0XHRcdFx0Ly9Ib3dldmVyLCBJRSByZXBvcnRzIHRoZSBzY3JpcHQgYXMgYmVpbmcgaW4gJ2ludGVyYWN0aXZlJ1xuXHRcdFx0XHRcdC8vcmVhZHlTdGF0ZSBhdCB0aGUgdGltZSBvZiB0aGUgZGVmaW5lIGNhbGwuXG5cdFx0XHRcdFx0dXNlSW50ZXJhY3RpdmUgPSB0cnVlO1xuXG5cdFx0XHRcdFx0bm9kZS5hdHRhY2hFdmVudCgnb25yZWFkeXN0YXRlY2hhbmdlJywgY29udGV4dC5vblNjcmlwdExvYWQpO1xuXHRcdFx0XHRcdC8vSXQgd291bGQgYmUgZ3JlYXQgdG8gYWRkIGFuIGVycm9yIGhhbmRsZXIgaGVyZSB0byBjYXRjaFxuXHRcdFx0XHRcdC8vNDA0cyBpbiBJRTkrLiBIb3dldmVyLCBvbnJlYWR5c3RhdGVjaGFuZ2Ugd2lsbCBmaXJlIGJlZm9yZVxuXHRcdFx0XHRcdC8vdGhlIGVycm9yIGhhbmRsZXIsIHNvIHRoYXQgZG9lcyBub3QgaGVscC4gSWYgYWRkRXZlbnRMaXN0ZW5lclxuXHRcdFx0XHRcdC8vaXMgdXNlZCwgdGhlbiBJRSB3aWxsIGZpcmUgZXJyb3IgYmVmb3JlIGxvYWQsIGJ1dCB3ZSBjYW5ub3Rcblx0XHRcdFx0XHQvL3VzZSB0aGF0IHBhdGh3YXkgZ2l2ZW4gdGhlIGNvbm5lY3QubWljcm9zb2Z0LmNvbSBpc3N1ZVxuXHRcdFx0XHRcdC8vbWVudGlvbmVkIGFib3ZlIGFib3V0IG5vdCBkb2luZyB0aGUgJ3NjcmlwdCBleGVjdXRlLFxuXHRcdFx0XHRcdC8vdGhlbiBmaXJlIHRoZSBzY3JpcHQgbG9hZCBldmVudCBsaXN0ZW5lciBiZWZvcmUgZXhlY3V0ZVxuXHRcdFx0XHRcdC8vbmV4dCBzY3JpcHQnIHRoYXQgb3RoZXIgYnJvd3NlcnMgZG8uXG5cdFx0XHRcdFx0Ly9CZXN0IGhvcGU6IElFMTAgZml4ZXMgdGhlIGlzc3Vlcyxcblx0XHRcdFx0XHQvL2FuZCB0aGVuIGRlc3Ryb3lzIGFsbCBpbnN0YWxscyBvZiBJRSA2LTkuXG5cdFx0XHRcdFx0Ly9ub2RlLmF0dGFjaEV2ZW50KCdvbmVycm9yJywgY29udGV4dC5vblNjcmlwdEVycm9yKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRub2RlLmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWQnLCBjb250ZXh0Lm9uU2NyaXB0TG9hZCwgZmFsc2UpO1xuXHRcdFx0XHRcdG5vZGUuYWRkRXZlbnRMaXN0ZW5lcignZXJyb3InLCBjb250ZXh0Lm9uU2NyaXB0RXJyb3IsIGZhbHNlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRub2RlLnNyYyA9IHVybDtcblxuXHRcdFx0XHQvL0NhbGxpbmcgb25Ob2RlQ3JlYXRlZCBhZnRlciBhbGwgcHJvcGVydGllcyBvbiB0aGUgbm9kZSBoYXZlIGJlZW5cblx0XHRcdFx0Ly9zZXQsIGJ1dCBiZWZvcmUgaXQgaXMgcGxhY2VkIGluIHRoZSBET00uXG5cdFx0XHRcdGlmIChjb25maWcub25Ob2RlQ3JlYXRlZCkge1xuXHRcdFx0XHRcdGNvbmZpZy5vbk5vZGVDcmVhdGVkKG5vZGUsIGNvbmZpZywgbW9kdWxlTmFtZSwgdXJsKTtcblx0XHRcdFx0fVxuXG5cdFx0XHRcdC8vRm9yIHNvbWUgY2FjaGUgY2FzZXMgaW4gSUUgNi04LCB0aGUgc2NyaXB0IGV4ZWN1dGVzIGJlZm9yZSB0aGUgZW5kXG5cdFx0XHRcdC8vb2YgdGhlIGFwcGVuZENoaWxkIGV4ZWN1dGlvbiwgc28gdG8gdGllIGFuIGFub255bW91cyBkZWZpbmVcblx0XHRcdFx0Ly9jYWxsIHRvIHRoZSBtb2R1bGUgbmFtZSAod2hpY2ggaXMgc3RvcmVkIG9uIHRoZSBub2RlKSwgaG9sZCBvblxuXHRcdFx0XHQvL3RvIGEgcmVmZXJlbmNlIHRvIHRoaXMgbm9kZSwgYnV0IGNsZWFyIGFmdGVyIHRoZSBET00gaW5zZXJ0aW9uLlxuXHRcdFx0XHRjdXJyZW50bHlBZGRpbmdTY3JpcHQgPSBub2RlO1xuXHRcdFx0XHRpZiAoYmFzZUVsZW1lbnQpIHtcblx0XHRcdFx0XHRoZWFkLmluc2VydEJlZm9yZShub2RlLCBiYXNlRWxlbWVudCk7XG5cdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0aGVhZC5hcHBlbmRDaGlsZChub2RlKTtcblx0XHRcdFx0fVxuXHRcdFx0XHRjdXJyZW50bHlBZGRpbmdTY3JpcHQgPSBudWxsO1xuXG5cdFx0XHRcdHJldHVybiBub2RlO1xuXHRcdFx0fSBlbHNlIGlmIChpc1dlYldvcmtlcikge1xuXHRcdFx0XHR0cnkge1xuXHRcdFx0XHRcdC8vSW4gYSB3ZWIgd29ya2VyLCB1c2UgaW1wb3J0U2NyaXB0cy4gVGhpcyBpcyBub3QgYSB2ZXJ5XG5cdFx0XHRcdFx0Ly9lZmZpY2llbnQgdXNlIG9mIGltcG9ydFNjcmlwdHMsIGltcG9ydFNjcmlwdHMgd2lsbCBibG9jayB1bnRpbFxuXHRcdFx0XHRcdC8vaXRzIHNjcmlwdCBpcyBkb3dubG9hZGVkIGFuZCBldmFsdWF0ZWQuIEhvd2V2ZXIsIGlmIHdlYiB3b3JrZXJzXG5cdFx0XHRcdFx0Ly9hcmUgaW4gcGxheSwgdGhlIGV4cGVjdGF0aW9uIGlzIHRoYXQgYSBidWlsZCBoYXMgYmVlbiBkb25lIHNvXG5cdFx0XHRcdFx0Ly90aGF0IG9ubHkgb25lIHNjcmlwdCBuZWVkcyB0byBiZSBsb2FkZWQgYW55d2F5LiBUaGlzIG1heSBuZWVkXG5cdFx0XHRcdFx0Ly90byBiZSByZWV2YWx1YXRlZCBpZiBvdGhlciB1c2UgY2FzZXMgYmVjb21lIGNvbW1vbi5cblxuXHRcdFx0XHRcdC8vIFBvc3QgYSB0YXNrIHRvIHRoZSBldmVudCBsb29wIHRvIHdvcmsgYXJvdW5kIGEgYnVnIGluIFdlYktpdFxuXHRcdFx0XHRcdC8vIHdoZXJlIHRoZSB3b3JrZXIgZ2V0cyBnYXJiYWdlLWNvbGxlY3RlZCBhZnRlciBjYWxsaW5nXG5cdFx0XHRcdFx0Ly8gaW1wb3J0U2NyaXB0cygpOiBodHRwczovL3dlYmtpdC5vcmcvYi8xNTMzMTdcblx0XHRcdFx0XHRzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge30sIDApO1xuXHRcdFx0XHRcdGltcG9ydFNjcmlwdHModXJsKTtcblxuXHRcdFx0XHRcdC8vQWNjb3VudCBmb3IgYW5vbnltb3VzIG1vZHVsZXNcblx0XHRcdFx0XHRjb250ZXh0LmNvbXBsZXRlTG9hZChtb2R1bGVOYW1lKTtcblx0XHRcdFx0fSBjYXRjaCAoZSkge1xuXHRcdFx0XHRcdGNvbnRleHQub25FcnJvcihtYWtlRXJyb3IoJ2ltcG9ydHNjcmlwdHMnLFxuXHRcdFx0XHRcdFx0XHRcdFx0J2ltcG9ydFNjcmlwdHMgZmFpbGVkIGZvciAnICtcblx0XHRcdFx0XHRcdFx0XHRcdFx0bW9kdWxlTmFtZSArICcgYXQgJyArIHVybCxcblx0XHRcdFx0XHRcdFx0XHRcdGUsXG5cdFx0XHRcdFx0XHRcdFx0XHRbbW9kdWxlTmFtZV0pKTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH07XG5cblx0XHRmdW5jdGlvbiBnZXRJbnRlcmFjdGl2ZVNjcmlwdCgpIHtcblx0XHRcdGlmIChpbnRlcmFjdGl2ZVNjcmlwdCAmJiBpbnRlcmFjdGl2ZVNjcmlwdC5yZWFkeVN0YXRlID09PSAnaW50ZXJhY3RpdmUnKSB7XG5cdFx0XHRcdHJldHVybiBpbnRlcmFjdGl2ZVNjcmlwdDtcblx0XHRcdH1cblxuXHRcdFx0ZWFjaFJldmVyc2Uoc2NyaXB0cygpLCBmdW5jdGlvbiAoc2NyaXB0KSB7XG5cdFx0XHRcdGlmIChzY3JpcHQucmVhZHlTdGF0ZSA9PT0gJ2ludGVyYWN0aXZlJykge1xuXHRcdFx0XHRcdHJldHVybiAoaW50ZXJhY3RpdmVTY3JpcHQgPSBzY3JpcHQpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHRcdHJldHVybiBpbnRlcmFjdGl2ZVNjcmlwdDtcblx0XHR9XG5cblx0XHQvL0xvb2sgZm9yIGEgZGF0YS1tYWluIHNjcmlwdCBhdHRyaWJ1dGUsIHdoaWNoIGNvdWxkIGFsc28gYWRqdXN0IHRoZSBiYXNlVXJsLlxuXHRcdGlmIChpc0Jyb3dzZXIgJiYgIWNmZy5za2lwRGF0YU1haW4pIHtcblx0XHRcdC8vRmlndXJlIG91dCBiYXNlVXJsLiBHZXQgaXQgZnJvbSB0aGUgc2NyaXB0IHRhZyB3aXRoIHJlcXVpcmUuanMgaW4gaXQuXG5cdFx0XHRlYWNoUmV2ZXJzZShzY3JpcHRzKCksIGZ1bmN0aW9uIChzY3JpcHQpIHtcblx0XHRcdFx0Ly9TZXQgdGhlICdoZWFkJyB3aGVyZSB3ZSBjYW4gYXBwZW5kIGNoaWxkcmVuIGJ5XG5cdFx0XHRcdC8vdXNpbmcgdGhlIHNjcmlwdCdzIHBhcmVudC5cblx0XHRcdFx0aWYgKCFoZWFkKSB7XG5cdFx0XHRcdFx0aGVhZCA9IHNjcmlwdC5wYXJlbnROb2RlO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0Ly9Mb29rIGZvciBhIGRhdGEtbWFpbiBhdHRyaWJ1dGUgdG8gc2V0IG1haW4gc2NyaXB0IGZvciB0aGUgcGFnZVxuXHRcdFx0XHQvL3RvIGxvYWQuIElmIGl0IGlzIHRoZXJlLCB0aGUgcGF0aCB0byBkYXRhIG1haW4gYmVjb21lcyB0aGVcblx0XHRcdFx0Ly9iYXNlVXJsLCBpZiBpdCBpcyBub3QgYWxyZWFkeSBzZXQuXG5cdFx0XHRcdGRhdGFNYWluID0gc2NyaXB0LmdldEF0dHJpYnV0ZSgnZGF0YS1tYWluJyk7XG5cdFx0XHRcdGlmIChkYXRhTWFpbikge1xuXHRcdFx0XHRcdC8vUHJlc2VydmUgZGF0YU1haW4gaW4gY2FzZSBpdCBpcyBhIHBhdGggKGkuZS4gY29udGFpbnMgJz8nKVxuXHRcdFx0XHRcdG1haW5TY3JpcHQgPSBkYXRhTWFpbjtcblxuXHRcdFx0XHRcdC8vU2V0IGZpbmFsIGJhc2VVcmwgaWYgdGhlcmUgaXMgbm90IGFscmVhZHkgYW4gZXhwbGljaXQgb25lLFxuXHRcdFx0XHRcdC8vYnV0IG9ubHkgZG8gc28gaWYgdGhlIGRhdGEtbWFpbiB2YWx1ZSBpcyBub3QgYSBsb2FkZXIgcGx1Z2luXG5cdFx0XHRcdFx0Ly9tb2R1bGUgSUQuXG5cdFx0XHRcdFx0aWYgKCFjZmcuYmFzZVVybCAmJiBtYWluU2NyaXB0LmluZGV4T2YoJyEnKSA9PT0gLTEpIHtcblx0XHRcdFx0XHRcdC8vUHVsbCBvZmYgdGhlIGRpcmVjdG9yeSBvZiBkYXRhLW1haW4gZm9yIHVzZSBhcyB0aGVcblx0XHRcdFx0XHRcdC8vYmFzZVVybC5cblx0XHRcdFx0XHRcdHNyYyA9IG1haW5TY3JpcHQuc3BsaXQoJy8nKTtcblx0XHRcdFx0XHRcdG1haW5TY3JpcHQgPSBzcmMucG9wKCk7XG5cdFx0XHRcdFx0XHRzdWJQYXRoID0gc3JjLmxlbmd0aCA/IHNyYy5qb2luKCcvJykgICsgJy8nIDogJy4vJztcblxuXHRcdFx0XHRcdFx0Y2ZnLmJhc2VVcmwgPSBzdWJQYXRoO1xuXHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdC8vU3RyaXAgb2ZmIGFueSB0cmFpbGluZyAuanMgc2luY2UgbWFpblNjcmlwdCBpcyBub3dcblx0XHRcdFx0XHQvL2xpa2UgYSBtb2R1bGUgbmFtZS5cblx0XHRcdFx0XHRtYWluU2NyaXB0ID0gbWFpblNjcmlwdC5yZXBsYWNlKGpzU3VmZml4UmVnRXhwLCAnJyk7XG5cblx0XHRcdFx0XHQvL0lmIG1haW5TY3JpcHQgaXMgc3RpbGwgYSBwYXRoLCBmYWxsIGJhY2sgdG8gZGF0YU1haW5cblx0XHRcdFx0XHRpZiAocmVxLmpzRXh0UmVnRXhwLnRlc3QobWFpblNjcmlwdCkpIHtcblx0XHRcdFx0XHRcdG1haW5TY3JpcHQgPSBkYXRhTWFpbjtcblx0XHRcdFx0XHR9XG5cblx0XHRcdFx0XHQvL1B1dCB0aGUgZGF0YS1tYWluIHNjcmlwdCBpbiB0aGUgZmlsZXMgdG8gbG9hZC5cblx0XHRcdFx0XHRjZmcuZGVwcyA9IGNmZy5kZXBzID8gY2ZnLmRlcHMuY29uY2F0KG1haW5TY3JpcHQpIDogW21haW5TY3JpcHRdO1xuXG5cdFx0XHRcdFx0cmV0dXJuIHRydWU7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHRcdH1cblxuXHRcdC8qKlxuXHRcdCAqIFRoZSBmdW5jdGlvbiB0aGF0IGhhbmRsZXMgZGVmaW5pdGlvbnMgb2YgbW9kdWxlcy4gRGlmZmVycyBmcm9tXG5cdFx0ICogcmVxdWlyZSgpIGluIHRoYXQgYSBzdHJpbmcgZm9yIHRoZSBtb2R1bGUgc2hvdWxkIGJlIHRoZSBmaXJzdCBhcmd1bWVudCxcblx0XHQgKiBhbmQgdGhlIGZ1bmN0aW9uIHRvIGV4ZWN1dGUgYWZ0ZXIgZGVwZW5kZW5jaWVzIGFyZSBsb2FkZWQgc2hvdWxkXG5cdFx0ICogcmV0dXJuIGEgdmFsdWUgdG8gZGVmaW5lIHRoZSBtb2R1bGUgY29ycmVzcG9uZGluZyB0byB0aGUgZmlyc3QgYXJndW1lbnQnc1xuXHRcdCAqIG5hbWUuXG5cdFx0ICovXG5cdFx0d2luZG93LmRlZmluZSA9IGZ1bmN0aW9uIChuYW1lLCBkZXBzLCBjYWxsYmFjaykge1xuXHRcdFx0dmFyIG5vZGUsIGNvbnRleHQ7XG5cblx0XHRcdC8vQWxsb3cgZm9yIGFub255bW91cyBtb2R1bGVzXG5cdFx0XHRpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG5cdFx0XHRcdC8vQWRqdXN0IGFyZ3MgYXBwcm9wcmlhdGVseVxuXHRcdFx0XHRjYWxsYmFjayA9IGRlcHM7XG5cdFx0XHRcdGRlcHMgPSBuYW1lO1xuXHRcdFx0XHRuYW1lID0gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0Ly9UaGlzIG1vZHVsZSBtYXkgbm90IGhhdmUgZGVwZW5kZW5jaWVzXG5cdFx0XHRpZiAoIWlzQXJyYXkoZGVwcykpIHtcblx0XHRcdFx0Y2FsbGJhY2sgPSBkZXBzO1xuXHRcdFx0XHRkZXBzID0gbnVsbDtcblx0XHRcdH1cblxuXHRcdFx0Ly9JZiBubyBuYW1lLCBhbmQgY2FsbGJhY2sgaXMgYSBmdW5jdGlvbiwgdGhlbiBmaWd1cmUgb3V0IGlmIGl0IGFcblx0XHRcdC8vQ29tbW9uSlMgdGhpbmcgd2l0aCBkZXBlbmRlbmNpZXMuXG5cdFx0XHRpZiAoIWRlcHMgJiYgaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcblx0XHRcdFx0ZGVwcyA9IFtdO1xuXHRcdFx0XHQvL1JlbW92ZSBjb21tZW50cyBmcm9tIHRoZSBjYWxsYmFjayBzdHJpbmcsXG5cdFx0XHRcdC8vbG9vayBmb3IgcmVxdWlyZSBjYWxscywgYW5kIHB1bGwgdGhlbSBpbnRvIHRoZSBkZXBlbmRlbmNpZXMsXG5cdFx0XHRcdC8vYnV0IG9ubHkgaWYgdGhlcmUgYXJlIGZ1bmN0aW9uIGFyZ3MuXG5cdFx0XHRcdGlmIChjYWxsYmFjay5sZW5ndGgpIHtcblx0XHRcdFx0XHRjYWxsYmFja1xuXHRcdFx0XHRcdFx0LnRvU3RyaW5nKClcblx0XHRcdFx0XHRcdC5yZXBsYWNlKGNvbW1lbnRSZWdFeHAsIGNvbW1lbnRSZXBsYWNlKVxuXHRcdFx0XHRcdFx0LnJlcGxhY2UoY2pzUmVxdWlyZVJlZ0V4cCwgZnVuY3Rpb24gKG1hdGNoLCBkZXApIHtcblx0XHRcdFx0XHRcdFx0ZGVwcy5wdXNoKGRlcCk7XG5cdFx0XHRcdFx0XHR9KTtcblxuXHRcdFx0XHRcdC8vTWF5IGJlIGEgQ29tbW9uSlMgdGhpbmcgZXZlbiB3aXRob3V0IHJlcXVpcmUgY2FsbHMsIGJ1dCBzdGlsbFxuXHRcdFx0XHRcdC8vY291bGQgdXNlIGV4cG9ydHMsIGFuZCBtb2R1bGUuIEF2b2lkIGRvaW5nIGV4cG9ydHMgYW5kIG1vZHVsZVxuXHRcdFx0XHRcdC8vd29yayB0aG91Z2ggaWYgaXQganVzdCBuZWVkcyByZXF1aXJlLlxuXHRcdFx0XHRcdC8vUkVRVUlSRVMgdGhlIGZ1bmN0aW9uIHRvIGV4cGVjdCB0aGUgQ29tbW9uSlMgdmFyaWFibGVzIGluIHRoZVxuXHRcdFx0XHRcdC8vb3JkZXIgbGlzdGVkIGJlbG93LlxuXHRcdFx0XHRcdGRlcHMgPSAoY2FsbGJhY2subGVuZ3RoID09PSAxID8gWydyZXF1aXJlJ10gOiBbJ3JlcXVpcmUnLCAnZXhwb3J0cycsICdtb2R1bGUnXSkuY29uY2F0KGRlcHMpO1xuXHRcdFx0XHR9XG5cdFx0XHR9XG5cblx0XHRcdC8vSWYgaW4gSUUgNi04IGFuZCBoaXQgYW4gYW5vbnltb3VzIGRlZmluZSgpIGNhbGwsIGRvIHRoZSBpbnRlcmFjdGl2ZVxuXHRcdFx0Ly93b3JrLlxuXHRcdFx0aWYgKHVzZUludGVyYWN0aXZlKSB7XG5cdFx0XHRcdG5vZGUgPSBjdXJyZW50bHlBZGRpbmdTY3JpcHQgfHwgZ2V0SW50ZXJhY3RpdmVTY3JpcHQoKTtcblx0XHRcdFx0aWYgKG5vZGUpIHtcblx0XHRcdFx0XHRpZiAoIW5hbWUpIHtcblx0XHRcdFx0XHRcdG5hbWUgPSBub2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlbW9kdWxlJyk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHRcdGNvbnRleHQgPSBjb250ZXh0c1tub2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZXF1aXJlY29udGV4dCcpXTtcblx0XHRcdFx0fVxuXHRcdFx0fVxuXG5cdFx0XHQvL0Fsd2F5cyBzYXZlIG9mZiBldmFsdWF0aW5nIHRoZSBkZWYgY2FsbCB1bnRpbCB0aGUgc2NyaXB0IG9ubG9hZCBoYW5kbGVyLlxuXHRcdFx0Ly9UaGlzIGFsbG93cyBtdWx0aXBsZSBtb2R1bGVzIHRvIGJlIGluIGEgZmlsZSB3aXRob3V0IHByZW1hdHVyZWx5XG5cdFx0XHQvL3RyYWNpbmcgZGVwZW5kZW5jaWVzLCBhbmQgYWxsb3dzIGZvciBhbm9ueW1vdXMgbW9kdWxlIHN1cHBvcnQsXG5cdFx0XHQvL3doZXJlIHRoZSBtb2R1bGUgbmFtZSBpcyBub3Qga25vd24gdW50aWwgdGhlIHNjcmlwdCBvbmxvYWQgZXZlbnRcblx0XHRcdC8vb2NjdXJzLiBJZiBubyBjb250ZXh0LCB1c2UgdGhlIGdsb2JhbCBxdWV1ZSwgYW5kIGdldCBpdCBwcm9jZXNzZWRcblx0XHRcdC8vaW4gdGhlIG9uc2NyaXB0IGxvYWQgY2FsbGJhY2suXG5cdFx0XHRpZiAoY29udGV4dCkge1xuXHRcdFx0XHRjb250ZXh0LmRlZlF1ZXVlLnB1c2goW25hbWUsIGRlcHMsIGNhbGxiYWNrXSk7XG5cdFx0XHRcdGNvbnRleHQuZGVmUXVldWVNYXBbbmFtZV0gPSB0cnVlO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0Z2xvYmFsRGVmUXVldWUucHVzaChbbmFtZSwgZGVwcywgY2FsbGJhY2tdKTtcblx0XHRcdH1cblx0XHR9O1xuXG5cdFx0ZGVmaW5lLmFtZCA9IHtcblx0XHRcdGpRdWVyeTogdHJ1ZVxuXHRcdH07XG5cblx0XHQvKipcblx0XHQgKiBFeGVjdXRlcyB0aGUgdGV4dC4gTm9ybWFsbHkganVzdCB1c2VzIGV2YWwsIGJ1dCBjYW4gYmUgbW9kaWZpZWRcblx0XHQgKiB0byB1c2UgYSBiZXR0ZXIsIGVudmlyb25tZW50LXNwZWNpZmljIGNhbGwuIE9ubHkgdXNlZCBmb3IgdHJhbnNwaWxpbmdcblx0XHQgKiBsb2FkZXIgcGx1Z2lucywgbm90IGZvciBwbGFpbiBKUyBtb2R1bGVzLlxuXHRcdCAqIEBwYXJhbSB7U3RyaW5nfSB0ZXh0IHRoZSB0ZXh0IHRvIGV4ZWN1dGUvZXZhbHVhdGUuXG5cdFx0ICovXG5cdFx0cmVxLmV4ZWMgPSBmdW5jdGlvbiAodGV4dCkge1xuXHRcdFx0Lypqc2xpbnQgZXZpbDogdHJ1ZSAqL1xuXHRcdFx0cmV0dXJuIGV2YWwodGV4dCk7XG5cdFx0fTtcblxuXHRcdC8vU2V0IHVwIHdpdGggY29uZmlnIGluZm8uXG5cdFx0cmVxKGNmZyk7XG5cdH0odGhpcywgKHR5cGVvZiBzZXRUaW1lb3V0ID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IHNldFRpbWVvdXQpKSk7XG4gICBgKTtcbiAgICBydW50aW1lLnB1c2goJ1xcbi8vLy9cXG4nKTtcbiAgICBydW50aW1lLnB1c2goY3JlYXRlSW1wb3J0TWFwKG1vZGVsLCBwYXRoLCBtb2RlbC5mbGFncy5yZW1hcEltcG9ydFNvdXJjZSkpO1xuICAgIHJ1bnRpbWUucHVzaCgnXFxuJyk7XG4gICAgcnVudGltZS5wdXNoKCdyZXF1aXJlanMuY29uZmlnKHtwYXRoOmltcG9ydERhdGF9KScpO1xuICAgIHJ1bnRpbWUucHVzaCgnXFxuJyk7XG59XG5mdW5jdGlvbiBnZW5lcmF0ZU5vZGVKc1J1bnRpbWUobW9kZWwsIHJ1bnRpbWUsIHBhdGgpIHtcbiAgICBpZiAobW9kZWwucHJvamVjdC5wcm9qZWN0RGVwZW5kZW5jaWVzLnNpemUpIHtcbiAgICAgICAgcnVudGltZS5wdXNoKGBcbiR7Y3JlYXRlSW1wb3J0TWFwKG1vZGVsLCBwYXRoLCBtb2RlbC5mbGFncy5yZW1hcEltcG9ydFNvdXJjZSl9XG5jb25zdCBtb2QgPSByZXF1aXJlKCdtb2R1bGUnKTtcblxuY29uc3Qgb3JpZ2luYWwgPSBtb2QucHJvdG90eXBlLnJlcXVpcmU7XG5tb2QucHJvdG90eXBlLnJlcXVpcmUgPSBmdW5jdGlvbihwYXRoLCAuLi5hcmdzKSB7XG5cdGlmIChpbXBvcnREYXRhW3BhdGhdKSB7XG5cdFx0cGF0aCA9IGltcG9ydERhdGFbcGF0aF07XG5cdFx0cmV0dXJuIG9yaWdpbmFsLmNhbGwobW9kdWxlLCBwYXRoLCAuLi5hcmdzKTtcblx0fSBlbHNlIHtcblx0XHRyZXR1cm4gb3JpZ2luYWwuY2FsbCh0aGlzLCBwYXRoLCAuLi5hcmdzKTtcblx0fVxufTtcbmApO1xuICAgIH1cbn1cbmZ1bmN0aW9uIGNyZWF0ZUltcG9ydE1hcChtb2RlbCwgcGF0aCwgcmVtYXApIHtcbiAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICBmb3IgKGNvbnN0IGRlcCBvZiBtb2RlbC5wcm9qZWN0LnByb2plY3REZXBlbmRlbmNpZXMpIHtcbiAgICAgICAgaWYgKHJlbWFwKSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChgJyR7ZGVwLnJlc29sdmVkQ29uZmlnLm5hbWV9JzogJyR7cGF0aF8xLmpvaW4ocmVtYXAsIGRlcC5yZXNvbHZlZENvbmZpZy5uYW1lKX0nYCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXN1bHQucHVzaChgJyR7ZGVwLnJlc29sdmVkQ29uZmlnLm5hbWV9JzogJyR7cGF0aF8xLnJlbGF0aXZlKHBhdGhfMS5wYXJzZShwYXRoKS5kaXIsIGRlcC5wYXRoKX0nYCk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGBjb25zdCBpbXBvcnREYXRhID0geyR7cmVzdWx0LmpvaW4oJywnKX19YDtcbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNuVnVkR2x0WlM1cWN5SXNJbk52ZFhKalpWSnZiM1FpT2lJaUxDSnpiM1Z5WTJWeklqcGJJbkoxYm5ScGJXVXVhbk1pWFN3aWJtRnRaWE1pT2x0ZExDSnRZWEJ3YVc1bmN5STZJanM3UVVGQlFTd3JRa0ZCTmtNN1FVRkROME1zVTBGQlowSXNUMEZCVHl4RFFVRkRMRWxCUVVrN1NVRkRlRUlzVDBGQlR5eExRVUZMTEVWQlFVVXNTMEZCU3l4RlFVRkZMRTlCUVU4c1JVRkJSU3hGUVVGRk8xRkJRelZDTEVsQlFVa3NSVUZCUlN4RFFVRkRPMUZCUTFBc1NVRkJTU3hKUVVGSkxFZEJRVWNzVjBGQlNTeERRVUZETEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1NVRkJTU3hGUVVGRkxFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXp0UlFVTTVReXhKUVVGSkxHTkJRV01zUjBGQlJ5eERRVUZETEVWQlFVVXNSMEZCUnl4SlFVRkpMRU5CUVVNc1kwRkJZeXhGUVVGRkxFTkJRVU1zUlVGQlJTeExRVUZMTEVsQlFVa3NTVUZCU1N4RlFVRkZMRXRCUVVzc1MwRkJTeXhEUVVGRExFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNRMEZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExFTkJRVU1zUTBGQlF6dFJRVU5xUnl4SlFVRkpMRTlCUVU4c1IwRkJSeXhsUVVGbExFTkJRVU1zU1VGQlNTeEZRVUZGTEV0QlFVc3NSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVOcVJDeE5RVUZOTEUxQlFVMHNSMEZCUnl4UFFVRlBMRU5CUVVNc1NVRkJTU3hEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETzFGQlEyaERMRWxCUVVrc1RVRkJUU3hMUVVGTExFTkJRVU1zVlVGQlZTeERRVUZETEUxQlFVMHNRMEZCUXl4SlFVRkpMRU5CUVVNc1JVRkJSVHRaUVVOeVF5eEpRVUZKTEZGQlFWRXNRMEZCUXp0WlFVTmlMRkZCUVZFc1kwRkJZeXhGUVVGRk8yZENRVU53UWl4TFFVRkxMRkZCUVZFN2IwSkJRMVFzVVVGQlVTeEhRVUZITEUxQlFVMHNTMEZCU3l4RFFVRkRMRlZCUVZVc1EwRkJReXhSUVVGUkxFTkJRVU1zU1VGQlNTeEZRVUZGTEUxQlFVMHNRMEZCUXl4RFFVRkRPMjlDUVVONlJDeE5RVUZOTEV0QlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1UwRkJVeXhEUVVGRExFbEJRVWtzUlVGQlJTeEhRVUZITEZGQlFWRXNTMEZCU3l4TlFVRk5MRVZCUVVVc1EwRkJReXhEUVVGRE8yOUNRVU5xUlN4TlFVRk5PMmRDUVVOV0xFdEJRVXNzVTBGQlV6dHZRa0ZEVml4TlFVRk5MRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJRenR2UWtGREwwTXNUVUZCVFR0blFrRkRWaXhMUVVGTExGTkJRVk03YjBKQlExWXNVVUZCVVN4SFFVRkhMRTFCUVUwc1MwRkJTeXhEUVVGRExGVkJRVlVzUTBGQlF5eFJRVUZSTEVOQlFVTXNTVUZCU1N4RlFVRkZMRTFCUVUwc1EwRkJReXhEUVVGRE8yOUNRVU42UkN4TlFVRk5MRXRCUVVzc1EwRkJReXhWUVVGVkxFTkJRVU1zVTBGQlV5eERRVUZETEVsQlFVa3NSVUZCUlN4SFFVRkhMRTFCUVUwc1MwRkJTeXhSUVVGUkxFVkJRVVVzUTBGQlF5eERRVUZETzI5Q1FVTnFSU3hOUVVGTk8yRkJRMkk3VTBGRFNqdGhRVU5KTzFsQlEwUXNUVUZCVFN4TFFVRkxMRU5CUVVNc1ZVRkJWU3hEUVVGRExGTkJRVk1zUTBGQlF5eEpRVUZKTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNN1UwRkRiRVE3VVVGRFJDeFBRVUZQTEV0QlFVc3NRMEZCUXp0SlFVTnFRaXhEUVVGRExFTkJRVU03UVVGRFRpeERRVUZETzBGQk5VSkVMREJDUVRSQ1F6dEJRVU5FTEZOQlFWTXNaVUZCWlN4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTExFVkJRVVVzU1VGQlNUdEpRVU4wUXl4SlFVRkpMRVZCUVVVc1EwRkJRenRKUVVOUUxFbEJRVWtzVDBGQlR5eEhRVUZITEVOQlFVTXNRMEZCUXl4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNTMEZCU3l4SlFVRkpMRWxCUVVrc1JVRkJSU3hMUVVGTExFdEJRVXNzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXl4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUXp0SlFVTTNSU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNZMEZCWXl4RFFVRkRMRkZCUVZFc1MwRkJTeXhUUVVGVExFVkJRVVU3VVVGRGNrUXNjMEpCUVhOQ0xFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRMUVVOb1JEdFRRVU5KTzFGQlEwUXNjVUpCUVhGQ0xFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRMUVVNdlF6dEpRVU5FTEVsQlFVa3NTVUZCU1N4RFFVRkRMRTFCUVUwc1JVRkJSVHRSUVVOaUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRTFCUVUwc1EwRkJReXhEUVVGRE8wdEJRemRDTzBsQlEwUXNUMEZCVHl4UFFVRlBMRU5CUVVNN1FVRkRia0lzUTBGQlF6dEJRVU5FTEZOQlFWTXNjMEpCUVhOQ0xFTkJRVU1zUzBGQlN5eEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpPMGxCUTJoRUxFOUJRVThzUTBGQlF5eEpRVUZKTEVOQlFVTTdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenM3T3pzN096czdPenRKUVN0clJXSXNRMEZCUXl4RFFVRkRPMGxCUTBZc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eFZRVUZWTEVOQlFVTXNRMEZCUXp0SlFVTjZRaXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4TFFVRkxMRVZCUVVVc1NVRkJTU3hGUVVGRkxFdEJRVXNzUTBGQlF5eExRVUZMTEVOQlFVTXNhVUpCUVdsQ0xFTkJRVU1zUTBGQlF5eERRVUZETzBsQlF6RkZMRTlCUVU4c1EwRkJReXhKUVVGSkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdTVUZEYmtJc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eHhRMEZCY1VNc1EwRkJReXhEUVVGRE8wbEJRM0JFTEU5QlFVOHNRMEZCUXl4SlFVRkpMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03UVVGRGRrSXNRMEZCUXp0QlFVTkVMRk5CUVZNc2NVSkJRWEZDTEVOQlFVTXNTMEZCU3l4RlFVRkZMRTlCUVU4c1JVRkJSU3hKUVVGSk8wbEJReTlETEVsQlFVa3NTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4SlFVRkpMRVZCUVVVN1VVRkRlRU1zVDBGQlR5eERRVUZETEVsQlFVa3NRMEZCUXp0RlFVTnVRaXhsUVVGbExFTkJRVU1zUzBGQlN5eEZRVUZGTEVsQlFVa3NSVUZCUlN4TFFVRkxMRU5CUVVNc1MwRkJTeXhEUVVGRExHbENRVUZwUWl4RFFVRkRPenM3T3pzN096czdPenM3UTBGWk5VUXNRMEZCUXl4RFFVRkRPMHRCUTBVN1FVRkRUQ3hEUVVGRE8wRkJRMFFzVTBGQlV5eGxRVUZsTEVOQlFVTXNTMEZCU3l4RlFVRkZMRWxCUVVrc1JVRkJSU3hMUVVGTE8wbEJRM1pETEUxQlFVMHNUVUZCVFN4SFFVRkhMRVZCUVVVc1EwRkJRenRKUVVOc1FpeExRVUZMTEUxQlFVMHNSMEZCUnl4SlFVRkpMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zYlVKQlFXMUNMRVZCUVVVN1VVRkRha1FzU1VGQlNTeExRVUZMTEVWQlFVVTdXVUZEVUN4TlFVRk5MRU5CUVVNc1NVRkJTU3hEUVVGRExFbEJRVWtzUjBGQlJ5eERRVUZETEdOQlFXTXNRMEZCUXl4SlFVRkpMRTlCUVU4c1YwRkJTU3hEUVVGRExFdEJRVXNzUlVGQlJTeEhRVUZITEVOQlFVTXNZMEZCWXl4RFFVRkRMRWxCUVVrc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dFRRVU14Ump0aFFVTkpPMWxCUTBRc1RVRkJUU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVkQlFVY3NRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hQUVVGUExHVkJRVkVzUTBGQlF5eFpRVUZMTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNc1IwRkJSeXhGUVVGRkxFZEJRVWNzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRU5CUVVNN1UwRkRla1k3UzBGRFNqdEpRVU5FTEU5QlFVOHNkVUpCUVhWQ0xFMUJRVTBzUTBGQlF5eEpRVUZKTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWRCUVVjc1EwRkJRenRCUVVOMFJDeERRVUZESW4wPSJdfQ==