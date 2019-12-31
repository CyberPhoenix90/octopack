"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
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
//# sourceMappingURL=config_resolver.js.map