"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_analyser_1 = require("static_analyser");
const path_1 = require("path");
function barrelFile(args) {
    return async (model, context) => {
        if (model.project.resolvedConfig.build.assembly === 'executable') {
            return model;
        }
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Generating barrel file`);
        const optMode = args.optMode;
        if (optMode !== 'in' && optMode !== 'out') {
            context.uiLogger.error(`Expected 'in' or 'out' as optMode but got ${optMode} instead. Not generating barrel file.`);
            return model;
        }
        const pragma = args.pragma;
        if (typeof pragma !== 'string') {
            context.uiLogger.error(`Expected string for pragma but received ${pragma} instead. Not generating barrel file.`);
            return model;
        }
        const fromProjectToBarrelFile = args.output;
        const barrelFileContent = [];
        const pathToBarrelFile = path_1.join(model.project.path, fromProjectToBarrelFile);
        const pathToBarrelFileFolder = path_1.parse(pathToBarrelFile).dir;
        for (const file of model.input) {
            if (file === pathToBarrelFile) {
                continue;
            }
            let includesPragma = false;
            new static_analyser_1.FileManipulator(await model.fileSystem.readFile(file, 'utf8')).forEachComment((c) => {
                if (c.includes(pragma)) {
                    includesPragma = true;
                }
                return undefined;
            });
            if ((['.ts', '.tsx', '.js', '.jsx'].some((c) => file.endsWith(c)) && optMode === 'in' && includesPragma) ||
                (optMode === 'out' && !includesPragma)) {
                const parsedExportPath = path_1.parse(path_1.relative(pathToBarrelFileFolder, file));
                let exportPath = path_1.join(parsedExportPath.dir, parsedExportPath.name);
                if (!exportPath.startsWith(`.${path_1.sep}`)) {
                    exportPath = `.${path_1.sep}${exportPath}`;
                }
                barrelFileContent.push(`export * from '${exportPath}';\n`);
            }
        }
        if (barrelFileContent.length) {
            await model.fileSystem.writeFile(pathToBarrelFile, barrelFileContent.sort().join(''));
        }
        return model;
    };
}
exports.barrelFile = barrelFile;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJhcnJlbF9maWxlLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYmFycmVsX2ZpbGUuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBzdGF0aWNfYW5hbHlzZXJfMSA9IHJlcXVpcmUoXCJzdGF0aWNfYW5hbHlzZXJcIik7XG5jb25zdCBwYXRoXzEgPSByZXF1aXJlKFwicGF0aFwiKTtcbmZ1bmN0aW9uIGJhcnJlbEZpbGUoYXJncykge1xuICAgIHJldHVybiBhc3luYyAobW9kZWwsIGNvbnRleHQpID0+IHtcbiAgICAgICAgaWYgKG1vZGVsLnByb2plY3QucmVzb2x2ZWRDb25maWcuYnVpbGQuYXNzZW1ibHkgPT09ICdleGVjdXRhYmxlJykge1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnRleHQudWlMb2dnZXIuaW5mbyhgWyR7bW9kZWwucHJvamVjdC5yZXNvbHZlZENvbmZpZy5uYW1lfV1HZW5lcmF0aW5nIGJhcnJlbCBmaWxlYCk7XG4gICAgICAgIGNvbnN0IG9wdE1vZGUgPSBhcmdzLm9wdE1vZGU7XG4gICAgICAgIGlmIChvcHRNb2RlICE9PSAnaW4nICYmIG9wdE1vZGUgIT09ICdvdXQnKSB7XG4gICAgICAgICAgICBjb250ZXh0LnVpTG9nZ2VyLmVycm9yKGBFeHBlY3RlZCAnaW4nIG9yICdvdXQnIGFzIG9wdE1vZGUgYnV0IGdvdCAke29wdE1vZGV9IGluc3RlYWQuIE5vdCBnZW5lcmF0aW5nIGJhcnJlbCBmaWxlLmApO1xuICAgICAgICAgICAgcmV0dXJuIG1vZGVsO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHByYWdtYSA9IGFyZ3MucHJhZ21hO1xuICAgICAgICBpZiAodHlwZW9mIHByYWdtYSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbnRleHQudWlMb2dnZXIuZXJyb3IoYEV4cGVjdGVkIHN0cmluZyBmb3IgcHJhZ21hIGJ1dCByZWNlaXZlZCAke3ByYWdtYX0gaW5zdGVhZC4gTm90IGdlbmVyYXRpbmcgYmFycmVsIGZpbGUuYCk7XG4gICAgICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnJvbVByb2plY3RUb0JhcnJlbEZpbGUgPSBhcmdzLm91dHB1dDtcbiAgICAgICAgY29uc3QgYmFycmVsRmlsZUNvbnRlbnQgPSBbXTtcbiAgICAgICAgY29uc3QgcGF0aFRvQmFycmVsRmlsZSA9IHBhdGhfMS5qb2luKG1vZGVsLnByb2plY3QucGF0aCwgZnJvbVByb2plY3RUb0JhcnJlbEZpbGUpO1xuICAgICAgICBjb25zdCBwYXRoVG9CYXJyZWxGaWxlRm9sZGVyID0gcGF0aF8xLnBhcnNlKHBhdGhUb0JhcnJlbEZpbGUpLmRpcjtcbiAgICAgICAgZm9yIChjb25zdCBmaWxlIG9mIG1vZGVsLmlucHV0KSB7XG4gICAgICAgICAgICBpZiAoZmlsZSA9PT0gcGF0aFRvQmFycmVsRmlsZSkge1xuICAgICAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGluY2x1ZGVzUHJhZ21hID0gZmFsc2U7XG4gICAgICAgICAgICBuZXcgc3RhdGljX2FuYWx5c2VyXzEuRmlsZU1hbmlwdWxhdG9yKGF3YWl0IG1vZGVsLmZpbGVTeXN0ZW0ucmVhZEZpbGUoZmlsZSwgJ3V0ZjgnKSkuZm9yRWFjaENvbW1lbnQoKGMpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoYy5pbmNsdWRlcyhwcmFnbWEpKSB7XG4gICAgICAgICAgICAgICAgICAgIGluY2x1ZGVzUHJhZ21hID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgaWYgKChbJy50cycsICcudHN4JywgJy5qcycsICcuanN4J10uc29tZSgoYykgPT4gZmlsZS5lbmRzV2l0aChjKSkgJiYgb3B0TW9kZSA9PT0gJ2luJyAmJiBpbmNsdWRlc1ByYWdtYSkgfHxcbiAgICAgICAgICAgICAgICAob3B0TW9kZSA9PT0gJ291dCcgJiYgIWluY2x1ZGVzUHJhZ21hKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHBhcnNlZEV4cG9ydFBhdGggPSBwYXRoXzEucGFyc2UocGF0aF8xLnJlbGF0aXZlKHBhdGhUb0JhcnJlbEZpbGVGb2xkZXIsIGZpbGUpKTtcbiAgICAgICAgICAgICAgICBsZXQgZXhwb3J0UGF0aCA9IHBhdGhfMS5qb2luKHBhcnNlZEV4cG9ydFBhdGguZGlyLCBwYXJzZWRFeHBvcnRQYXRoLm5hbWUpO1xuICAgICAgICAgICAgICAgIGlmICghZXhwb3J0UGF0aC5zdGFydHNXaXRoKGAuJHtwYXRoXzEuc2VwfWApKSB7XG4gICAgICAgICAgICAgICAgICAgIGV4cG9ydFBhdGggPSBgLiR7cGF0aF8xLnNlcH0ke2V4cG9ydFBhdGh9YDtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgYmFycmVsRmlsZUNvbnRlbnQucHVzaChgZXhwb3J0ICogZnJvbSAnJHtleHBvcnRQYXRofSc7XFxuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJhcnJlbEZpbGVDb250ZW50Lmxlbmd0aCkge1xuICAgICAgICAgICAgYXdhaXQgbW9kZWwuZmlsZVN5c3RlbS53cml0ZUZpbGUocGF0aFRvQmFycmVsRmlsZSwgYmFycmVsRmlsZUNvbnRlbnQuc29ydCgpLmpvaW4oJycpKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgfTtcbn1cbmV4cG9ydHMuYmFycmVsRmlsZSA9IGJhcnJlbEZpbGU7XG4vLyMgc291cmNlTWFwcGluZ1VSTD1kYXRhOmFwcGxpY2F0aW9uL2pzb247YmFzZTY0LGV5SjJaWEp6YVc5dUlqb3pMQ0ptYVd4bElqb2lZbUZ5Y21Wc1gyWnBiR1V1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SmlZWEp5Wld4ZlptbHNaUzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3p0QlFVRkJMSEZFUVVGclJEdEJRVU5zUkN3clFrRkJhMFE3UVVGRGJFUXNVMEZCWjBJc1ZVRkJWU3hEUVVGRExFbEJRVWs3U1VGRE0wSXNUMEZCVHl4TFFVRkxMRVZCUVVVc1MwRkJTeXhGUVVGRkxFOUJRVThzUlVGQlJTeEZRVUZGTzFGQlF6VkNMRWxCUVVrc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eGpRVUZqTEVOQlFVTXNTMEZCU3l4RFFVRkRMRkZCUVZFc1MwRkJTeXhaUVVGWkxFVkJRVVU3V1VGRE9VUXNUMEZCVHl4TFFVRkxMRU5CUVVNN1UwRkRhRUk3VVVGRFJDeFBRVUZQTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhKUVVGSkxFdEJRVXNzUTBGQlF5eFBRVUZQTEVOQlFVTXNZMEZCWXl4RFFVRkRMRWxCUVVrc2VVSkJRWGxDTEVOQlFVTXNRMEZCUXp0UlFVTjBSaXhOUVVGTkxFOUJRVThzUjBGQlJ5eEpRVUZKTEVOQlFVTXNUMEZCVHl4RFFVRkRPMUZCUXpkQ0xFbEJRVWtzVDBGQlR5eExRVUZMTEVsQlFVa3NTVUZCU1N4UFFVRlBMRXRCUVVzc1MwRkJTeXhGUVVGRk8xbEJRM1pETEU5QlFVOHNRMEZCUXl4UlFVRlJMRU5CUVVNc1MwRkJTeXhEUVVGRExEWkRRVUUyUXl4UFFVRlBMSFZEUVVGMVF5eERRVUZETEVOQlFVTTdXVUZEY0Vnc1QwRkJUeXhMUVVGTExFTkJRVU03VTBGRGFFSTdVVUZEUkN4TlFVRk5MRTFCUVUwc1IwRkJSeXhKUVVGSkxFTkJRVU1zVFVGQlRTeERRVUZETzFGQlF6TkNMRWxCUVVrc1QwRkJUeXhOUVVGTkxFdEJRVXNzVVVGQlVTeEZRVUZGTzFsQlF6VkNMRTlCUVU4c1EwRkJReXhSUVVGUkxFTkJRVU1zUzBGQlN5eERRVUZETERKRFFVRXlReXhOUVVGTkxIVkRRVUYxUXl4RFFVRkRMRU5CUVVNN1dVRkRha2dzVDBGQlR5eExRVUZMTEVOQlFVTTdVMEZEYUVJN1VVRkRSQ3hOUVVGTkxIVkNRVUYxUWl4SFFVRkhMRWxCUVVrc1EwRkJReXhOUVVGTkxFTkJRVU03VVVGRE5VTXNUVUZCVFN4cFFrRkJhVUlzUjBGQlJ5eEZRVUZGTEVOQlFVTTdVVUZETjBJc1RVRkJUU3huUWtGQlowSXNSMEZCUnl4WFFVRkpMRU5CUVVNc1MwRkJTeXhEUVVGRExFOUJRVThzUTBGQlF5eEpRVUZKTEVWQlFVVXNkVUpCUVhWQ0xFTkJRVU1zUTBGQlF6dFJRVU16UlN4TlFVRk5MSE5DUVVGelFpeEhRVUZITEZsQlFVc3NRMEZCUXl4blFrRkJaMElzUTBGQlF5eERRVUZETEVkQlFVY3NRMEZCUXp0UlFVTXpSQ3hMUVVGTExFMUJRVTBzU1VGQlNTeEpRVUZKTEV0QlFVc3NRMEZCUXl4TFFVRkxMRVZCUVVVN1dVRkROVUlzU1VGQlNTeEpRVUZKTEV0QlFVc3NaMEpCUVdkQ0xFVkJRVVU3WjBKQlF6TkNMRk5CUVZNN1lVRkRXanRaUVVORUxFbEJRVWtzWTBGQll5eEhRVUZITEV0QlFVc3NRMEZCUXp0WlFVTXpRaXhKUVVGSkxHbERRVUZsTEVOQlFVTXNUVUZCVFN4TFFVRkxMRU5CUVVNc1ZVRkJWU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVWQlFVVXNUVUZCVFN4RFFVRkRMRU5CUVVNc1EwRkJReXhqUVVGakxFTkJRVU1zUTBGQlF5eERRVUZETEVWQlFVVXNSVUZCUlR0blFrRkRjRVlzU1VGQlNTeERRVUZETEVOQlFVTXNVVUZCVVN4RFFVRkRMRTFCUVUwc1EwRkJReXhGUVVGRk8yOUNRVU53UWl4alFVRmpMRWRCUVVjc1NVRkJTU3hEUVVGRE8ybENRVU42UWp0blFrRkRSQ3hQUVVGUExGTkJRVk1zUTBGQlF6dFpRVU55UWl4RFFVRkRMRU5CUVVNc1EwRkJRenRaUVVOSUxFbEJRVWtzUTBGQlF5eERRVUZETEV0QlFVc3NSVUZCUlN4TlFVRk5MRVZCUVVVc1MwRkJTeXhGUVVGRkxFMUJRVTBzUTBGQlF5eERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhKUVVGSkxFOUJRVThzUzBGQlN5eEpRVUZKTEVsQlFVa3NZMEZCWXl4RFFVRkRPMmRDUVVOd1J5eERRVUZETEU5QlFVOHNTMEZCU3l4TFFVRkxMRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zUlVGQlJUdG5Ra0ZEZUVNc1RVRkJUU3huUWtGQlowSXNSMEZCUnl4WlFVRkxMRU5CUVVNc1pVRkJVU3hEUVVGRExITkNRVUZ6UWl4RlFVRkZMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU03WjBKQlEzWkZMRWxCUVVrc1ZVRkJWU3hIUVVGSExGZEJRVWtzUTBGQlF5eG5Ra0ZCWjBJc1EwRkJReXhIUVVGSExFVkJRVVVzWjBKQlFXZENMRU5CUVVNc1NVRkJTU3hEUVVGRExFTkJRVU03WjBKQlEyNUZMRWxCUVVrc1EwRkJReXhWUVVGVkxFTkJRVU1zVlVGQlZTeERRVUZETEVsQlFVa3NWVUZCUnl4RlFVRkZMRU5CUVVNc1JVRkJSVHR2UWtGRGJrTXNWVUZCVlN4SFFVRkhMRWxCUVVrc1ZVRkJSeXhIUVVGSExGVkJRVlVzUlVGQlJTeERRVUZETzJsQ1FVTjJRenRuUWtGRFJDeHBRa0ZCYVVJc1EwRkJReXhKUVVGSkxFTkJRVU1zYTBKQlFXdENMRlZCUVZVc1RVRkJUU3hEUVVGRExFTkJRVU03WVVGRE9VUTdVMEZEU2p0UlFVTkVMRWxCUVVrc2FVSkJRV2xDTEVOQlFVTXNUVUZCVFN4RlFVRkZPMWxCUXpGQ0xFMUJRVTBzUzBGQlN5eERRVUZETEZWQlFWVXNRMEZCUXl4VFFVRlRMRU5CUVVNc1owSkJRV2RDTEVWQlFVVXNhVUpCUVdsQ0xFTkJRVU1zU1VGQlNTeEZRVUZGTEVOQlFVTXNTVUZCU1N4RFFVRkRMRVZCUVVVc1EwRkJReXhEUVVGRExFTkJRVU03VTBGRGVrWTdVVUZEUkN4UFFVRlBMRXRCUVVzc1EwRkJRenRKUVVOcVFpeERRVUZETEVOQlFVTTdRVUZEVGl4RFFVRkRPMEZCT1VORUxHZERRVGhEUXlKOSJdfQ==