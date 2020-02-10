"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const utilities_1 = require("utilities");
exports.OCTOPACK_CONFIG_FILE_NAME = 'octopack.js';
async function findConfiguration(cwd, fileSystem) {
    const segments = cwd.split('/');
    while (segments.length) {
        const path = segments.join('/');
        if (await fileSystem.exists(path_1.join(path, exports.OCTOPACK_CONFIG_FILE_NAME))) {
            return { config: await loadConfig(path, fileSystem), directory: path };
        }
        else {
            segments.pop();
        }
    }
    return { directory: '/', config: undefined };
}
exports.findConfiguration = findConfiguration;
function resolveConfig(configs) {
    return utilities_1.objectUtils.deepAssign({
        assembly: undefined,
        platform: undefined,
        build: undefined,
        configVersion: undefined,
        name: undefined,
        scope: undefined
    }, configs.solution, configs.workspace, configs.project);
}
exports.resolveConfig = resolveConfig;
async function loadConfig(path, fileSystem) {
    const config = await fileSystem.import(path_1.join(path, exports.OCTOPACK_CONFIG_FILE_NAME));
    if (!config && !config.default) {
        throw new Error(`Invalid octopack configuration at ${path}. No configuration returned`);
    }
    // telling typescript to ignore this because we normalize the object
    if (config.default) {
        //@ts-ignore
        config = config.default;
    }
    return config;
}
exports.loadConfig = loadConfig;
function getBundle(config, candidates) {
    const bundles = Object.keys(config.build.bundles);
    let defaultBundle;
    for (const bundle of bundles) {
        if (candidates[bundle] === true) {
            return bundle;
        }
        if (config.build.bundles[bundle].default) {
            defaultBundle = bundle;
        }
    }
    if (defaultBundle) {
        return defaultBundle;
    }
    else if (bundles.length === 1) {
        return bundles[0];
    }
    else {
        return undefined;
    }
}
exports.getBundle = getBundle;