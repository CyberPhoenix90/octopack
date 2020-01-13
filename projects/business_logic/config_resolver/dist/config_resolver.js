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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlnX3Jlc29sdmVyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUVBLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxNQUFNLENBQUM7QUFDNUIsT0FBTyxFQUFFLFdBQVcsRUFBRSxNQUFNLDhCQUE4QixDQUFDO0FBRTNELE1BQU0sQ0FBQyxNQUFNLHlCQUF5QixHQUFHLGFBQWEsQ0FBQztBQUV2RCxNQUFNLENBQUMsS0FBSyxVQUFVLGlCQUFpQixDQUN0QyxHQUFXLEVBQ1gsVUFBK0I7SUFFL0IsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxPQUFPLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDdkIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUVoQyxJQUFJLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHlCQUF5QixDQUFDLENBQUMsRUFBRTtZQUNuRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7U0FDdkU7YUFBTTtZQUNOLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNmO0tBQ0Q7SUFDRCxPQUFPLEVBQUUsU0FBUyxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsU0FBUyxFQUFFLENBQUM7QUFDOUMsQ0FBQztBQUVELE1BQU0sVUFBVSxhQUFhLENBQUMsT0FJN0I7SUFDQSxPQUFPLFdBQVcsQ0FBQyxVQUFVLENBQzVCO1FBQ0MsS0FBSyxFQUFFLFNBQVM7UUFDaEIsYUFBYSxFQUFFLFNBQVM7UUFDeEIsSUFBSSxFQUFFLFNBQVM7UUFDZixLQUFLLEVBQUUsU0FBUztLQUNoQixFQUNELE9BQU8sQ0FBQyxRQUFRLEVBQ2hCLE9BQU8sQ0FBQyxTQUFTLEVBQ2pCLE9BQU8sQ0FBQyxPQUFPLENBQ2YsQ0FBQztBQUNILENBQUM7QUFFRCxNQUFNLENBQUMsS0FBSyxVQUFVLFVBQVUsQ0FBQyxJQUFZLEVBQUUsVUFBK0I7SUFDN0UsTUFBTSxNQUFNLEdBQTBCLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxFQUFFLHlCQUF5QixDQUFDLENBQUMsQ0FBQztJQUNyRyxJQUFJLENBQUMsTUFBTSxJQUFJLENBQUUsTUFBYyxDQUFDLE9BQU8sRUFBRTtRQUN4QyxNQUFNLElBQUksS0FBSyxDQUFDLHFDQUFxQyxJQUFJLDZCQUE2QixDQUFDLENBQUM7S0FDeEY7SUFDRCxvRUFBb0U7SUFDcEUsSUFBSyxNQUFjLENBQUMsT0FBTyxFQUFFO1FBQzVCLFlBQVk7UUFDWixNQUFNLEdBQUcsTUFBTSxDQUFDLE9BQU8sQ0FBQztLQUN4QjtJQUVELE9BQU8sTUFBTSxDQUFDO0FBQ2YsQ0FBQyJ9
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY29uZmlnX3Jlc29sdmVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiY29uZmlnX3Jlc29sdmVyLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQTRCO0FBQzVCLDREQUEyRDtBQUM5QyxRQUFBLHlCQUF5QixHQUFHLGFBQWEsQ0FBQztBQUNoRCxLQUFLLFVBQVUsaUJBQWlCLENBQUMsR0FBRyxFQUFFLFVBQVU7SUFDbkQsTUFBTSxRQUFRLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxPQUFPLFFBQVEsQ0FBQyxNQUFNLEVBQUU7UUFDcEIsTUFBTSxJQUFJLEdBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNoQyxJQUFJLE1BQU0sVUFBVSxDQUFDLE1BQU0sQ0FBQyxXQUFJLENBQUMsSUFBSSxFQUFFLGlDQUF5QixDQUFDLENBQUMsRUFBRTtZQUNoRSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sVUFBVSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7U0FDMUU7YUFDSTtZQUNELFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQztTQUNsQjtLQUNKO0lBQ0QsT0FBTyxFQUFFLFNBQVMsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLFNBQVMsRUFBRSxDQUFDO0FBQ2pELENBQUM7QUFaRCw4Q0FZQztBQUNELFNBQWdCLGFBQWEsQ0FBQyxPQUFPO0lBQ2pDLE9BQU8sdUJBQVcsQ0FBQyxVQUFVLENBQUM7UUFDMUIsS0FBSyxFQUFFLFNBQVM7UUFDaEIsYUFBYSxFQUFFLFNBQVM7UUFDeEIsSUFBSSxFQUFFLFNBQVM7UUFDZixLQUFLLEVBQUUsU0FBUztLQUNuQixFQUFFLE9BQU8sQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLFNBQVMsRUFBRSxPQUFPLENBQUMsT0FBTyxDQUFDLENBQUM7QUFDN0QsQ0FBQztBQVBELHNDQU9DO0FBQ00sS0FBSyxVQUFVLFVBQVUsQ0FBQyxJQUFJLEVBQUUsVUFBVTtJQUM3QyxNQUFNLE1BQU0sR0FBRyxNQUFNLFVBQVUsQ0FBQyxNQUFNLENBQUMsV0FBSSxDQUFDLElBQUksRUFBRSxpQ0FBeUIsQ0FBQyxDQUFDLENBQUM7SUFDOUUsSUFBSSxDQUFDLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxPQUFPLEVBQUU7UUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQyxxQ0FBcUMsSUFBSSw2QkFBNkIsQ0FBQyxDQUFDO0tBQzNGO0lBQ0Qsb0VBQW9FO0lBQ3BFLElBQUksTUFBTSxDQUFDLE9BQU8sRUFBRTtRQUNoQixZQUFZO1FBQ1osTUFBTSxHQUFHLE1BQU0sQ0FBQyxPQUFPLENBQUM7S0FDM0I7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNsQixDQUFDO0FBWEQsZ0NBV0M7QUFDRCwweURBQTB5RCJ9