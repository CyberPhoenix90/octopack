"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const utilities_1 = require("../../../libraries/utilities");
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlnX3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsK0JBQTRCO0FBQzVCLDREQUEyRDtBQUU5QyxRQUFBLHlCQUF5QixHQUFHLGFBQWEsQ0FBQztBQUVoRCxLQUFLLFVBQVUsaUJBQWlCLENBQ3RDLEdBQVcsRUFDWCxVQUErQjtJQUUvQixNQUFNLFFBQVEsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLE9BQU8sUUFBUSxDQUFDLE1BQU0sRUFBRTtRQUN2QixNQUFNLElBQUksR0FBRyxRQUFRLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBRWhDLElBQUksTUFBTSxVQUFVLENBQUMsTUFBTSxDQUFDLFdBQUksQ0FBQyxJQUFJLEVBQUUsaUNBQXlCLENBQUMsQ0FBQyxFQUFFO1lBQ25FLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxVQUFVLENBQUMsSUFBSSxFQUFFLFVBQVUsQ0FBQyxFQUFFLFNBQVMsRUFBRSxJQUFJLEVBQUUsQ0FBQztTQUN2RTthQUFNO1lBQ04sUUFBUSxDQUFDLEdBQUcsRUFBRSxDQUFDO1NBQ2Y7S0FDRDtJQUNELE9BQU8sRUFBRSxTQUFTLEVBQUUsR0FBRyxFQUFFLE1BQU0sRUFBRSxTQUFTLEVBQUUsQ0FBQztBQUM5QyxDQUFDO0FBZkQsOENBZUM7QUFFRCxTQUFnQixhQUFhLENBQUMsT0FJN0I7SUFDQSxPQUFPLHVCQUFXLENBQUMsVUFBVSxDQUM1QjtRQUNDLEtBQUssRUFBRSxTQUFTO1FBQ2hCLGFBQWEsRUFBRSxTQUFTO1FBQ3hCLElBQUksRUFBRSxTQUFTO1FBQ2YsS0FBSyxFQUFFLFNBQVM7S0FDaEIsRUFDRCxPQUFPLENBQUMsUUFBUSxFQUNoQixPQUFPLENBQUMsU0FBUyxFQUNqQixPQUFPLENBQUMsT0FBTyxDQUNmLENBQUM7QUFDSCxDQUFDO0FBaEJELHNDQWdCQztBQUVNLEtBQUssVUFBVSxVQUFVLENBQUMsSUFBWSxFQUFFLFVBQStCO0lBQzdFLE1BQU0sTUFBTSxHQUEwQixNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBSSxDQUFDLElBQUksRUFBRSxpQ0FBeUIsQ0FBQyxDQUFDLENBQUM7SUFDckcsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFFLE1BQWMsQ0FBQyxPQUFPLEVBQUU7UUFDeEMsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsSUFBSSw2QkFBNkIsQ0FBQyxDQUFDO0tBQ3hGO0lBQ0Qsb0VBQW9FO0lBQ3BFLElBQUssTUFBYyxDQUFDLE9BQU8sRUFBRTtRQUM1QixZQUFZO1FBQ1osTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7S0FDeEI7SUFFRCxPQUFPLE1BQU0sQ0FBQztBQUNmLENBQUM7QUFaRCxnQ0FZQyJ9