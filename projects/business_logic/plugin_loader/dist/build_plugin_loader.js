"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const npm_installer_1 = require("npm_installer");
const project_importer_1 = require("project_importer");
const typescript_plugin_1 = require("typescript_plugin");
const meta_programming_1 = require("meta_programming");
const barrel_file_1 = require("barrel_file");
const output_plugin_1 = require("output_plugin");
const runtime_1 = require("runtime");
function loadBuildPlugin(plugin) {
    if (typeof plugin === 'string') {
        return initializePlugin(plugin, {});
    }
    else {
        return initializePlugin(plugin.name, plugin.config);
    }
}
exports.loadBuildPlugin = loadBuildPlugin;
function initializePlugin(name, args) {
    switch (name) {
        case 'projectImporter':
            return project_importer_1.projectImporter(args);
        case 'typescript':
            return typescript_plugin_1.typescript(args);
        case 'npmInstall':
            return npm_installer_1.npmInstall(args);
        case 'metaProgramming':
            return meta_programming_1.metaProgramming(args);
        case 'barrelFile':
            return barrel_file_1.barrelFile(args);
        case 'output':
            return output_plugin_1.output(args);
        case 'runtime':
            return runtime_1.runtime(args);
        default:
            throw new Error(`Plugin ${name} not found`);
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkX3BsdWdpbl9sb2FkZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImJ1aWxkX3BsdWdpbl9sb2FkZXIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBucG1faW5zdGFsbGVyXzEgPSByZXF1aXJlKFwibnBtX2luc3RhbGxlclwiKTtcbmNvbnN0IHByb2plY3RfaW1wb3J0ZXJfMSA9IHJlcXVpcmUoXCJwcm9qZWN0X2ltcG9ydGVyXCIpO1xuY29uc3QgdHlwZXNjcmlwdF9wbHVnaW5fMSA9IHJlcXVpcmUoXCJ0eXBlc2NyaXB0X3BsdWdpblwiKTtcbmNvbnN0IG1ldGFfcHJvZ3JhbW1pbmdfMSA9IHJlcXVpcmUoXCJtZXRhX3Byb2dyYW1taW5nXCIpO1xuY29uc3QgYmFycmVsX2ZpbGVfMSA9IHJlcXVpcmUoXCJiYXJyZWxfZmlsZVwiKTtcbmNvbnN0IG91dHB1dF9wbHVnaW5fMSA9IHJlcXVpcmUoXCJvdXRwdXRfcGx1Z2luXCIpO1xuY29uc3QgcnVudGltZV8xID0gcmVxdWlyZShcInJ1bnRpbWVcIik7XG5mdW5jdGlvbiBsb2FkQnVpbGRQbHVnaW4ocGx1Z2luKSB7XG4gICAgaWYgKHR5cGVvZiBwbHVnaW4gPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIHJldHVybiBpbml0aWFsaXplUGx1Z2luKHBsdWdpbiwge30pO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIGluaXRpYWxpemVQbHVnaW4ocGx1Z2luLm5hbWUsIHBsdWdpbi5jb25maWcpO1xuICAgIH1cbn1cbmV4cG9ydHMubG9hZEJ1aWxkUGx1Z2luID0gbG9hZEJ1aWxkUGx1Z2luO1xuZnVuY3Rpb24gaW5pdGlhbGl6ZVBsdWdpbihuYW1lLCBhcmdzKSB7XG4gICAgc3dpdGNoIChuYW1lKSB7XG4gICAgICAgIGNhc2UgJ3Byb2plY3RJbXBvcnRlcic6XG4gICAgICAgICAgICByZXR1cm4gcHJvamVjdF9pbXBvcnRlcl8xLnByb2plY3RJbXBvcnRlcihhcmdzKTtcbiAgICAgICAgY2FzZSAndHlwZXNjcmlwdCc6XG4gICAgICAgICAgICByZXR1cm4gdHlwZXNjcmlwdF9wbHVnaW5fMS50eXBlc2NyaXB0KGFyZ3MpO1xuICAgICAgICBjYXNlICducG1JbnN0YWxsJzpcbiAgICAgICAgICAgIHJldHVybiBucG1faW5zdGFsbGVyXzEubnBtSW5zdGFsbChhcmdzKTtcbiAgICAgICAgY2FzZSAnbWV0YVByb2dyYW1taW5nJzpcbiAgICAgICAgICAgIHJldHVybiBtZXRhX3Byb2dyYW1taW5nXzEubWV0YVByb2dyYW1taW5nKGFyZ3MpO1xuICAgICAgICBjYXNlICdiYXJyZWxGaWxlJzpcbiAgICAgICAgICAgIHJldHVybiBiYXJyZWxfZmlsZV8xLmJhcnJlbEZpbGUoYXJncyk7XG4gICAgICAgIGNhc2UgJ291dHB1dCc6XG4gICAgICAgICAgICByZXR1cm4gb3V0cHV0X3BsdWdpbl8xLm91dHB1dChhcmdzKTtcbiAgICAgICAgY2FzZSAncnVudGltZSc6XG4gICAgICAgICAgICByZXR1cm4gcnVudGltZV8xLnJ1bnRpbWUoYXJncyk7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFBsdWdpbiAke25hbWV9IG5vdCBmb3VuZGApO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVluVnBiR1JmY0d4MVoybHVYMnh2WVdSbGNpNXFjeUlzSW5OdmRYSmpaVkp2YjNRaU9pSWlMQ0p6YjNWeVkyVnpJanBiSW1KMWFXeGtYM0JzZFdkcGJsOXNiMkZrWlhJdWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdRVUZCUVN4cFJFRkJNa003UVVGRE0wTXNkVVJCUVcxRU8wRkJRMjVFTEhsRVFVRXJRenRCUVVNdlF5eDFSRUZCYlVRN1FVRkRia1FzTmtOQlFYbERPMEZCUTNwRExHbEVRVUYxUXp0QlFVTjJReXh4UTBGQmEwTTdRVUZEYkVNc1UwRkJaMElzWlVGQlpTeERRVUZETEUxQlFVMDdTVUZEYkVNc1NVRkJTU3hQUVVGUExFMUJRVTBzUzBGQlN5eFJRVUZSTEVWQlFVVTdVVUZETlVJc1QwRkJUeXhuUWtGQlowSXNRMEZCUXl4TlFVRk5MRVZCUVVVc1JVRkJSU3hEUVVGRExFTkJRVU03UzBGRGRrTTdVMEZEU1R0UlFVTkVMRTlCUVU4c1owSkJRV2RDTEVOQlFVTXNUVUZCVFN4RFFVRkRMRWxCUVVrc1JVRkJSU3hOUVVGTkxFTkJRVU1zVFVGQlRTeERRVUZETEVOQlFVTTdTMEZEZGtRN1FVRkRUQ3hEUVVGRE8wRkJVRVFzTUVOQlQwTTdRVUZEUkN4VFFVRlRMR2RDUVVGblFpeERRVUZETEVsQlFVa3NSVUZCUlN4SlFVRkpPMGxCUTJoRExGRkJRVkVzU1VGQlNTeEZRVUZGTzFGQlExWXNTMEZCU3l4cFFrRkJhVUk3V1VGRGJFSXNUMEZCVHl4clEwRkJaU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEycERMRXRCUVVzc1dVRkJXVHRaUVVOaUxFOUJRVThzT0VKQlFWVXNRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJRenRSUVVNMVFpeExRVUZMTEZsQlFWazdXVUZEWWl4UFFVRlBMREJDUVVGVkxFTkJRVU1zU1VGQlNTeERRVUZETEVOQlFVTTdVVUZETlVJc1MwRkJTeXhwUWtGQmFVSTdXVUZEYkVJc1QwRkJUeXhyUTBGQlpTeERRVUZETEVsQlFVa3NRMEZCUXl4RFFVRkRPMUZCUTJwRExFdEJRVXNzV1VGQldUdFpRVU5pTEU5QlFVOHNkMEpCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zUTBGQlF6dFJRVU0xUWl4TFFVRkxMRkZCUVZFN1dVRkRWQ3hQUVVGUExITkNRVUZOTEVOQlFVTXNTVUZCU1N4RFFVRkRMRU5CUVVNN1VVRkRlRUlzUzBGQlN5eFRRVUZUTzFsQlExWXNUMEZCVHl4cFFrRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEzcENPMWxCUTBrc1RVRkJUU3hKUVVGSkxFdEJRVXNzUTBGQlF5eFZRVUZWTEVsQlFVa3NXVUZCV1N4RFFVRkRMRU5CUVVNN1MwRkRia1E3UVVGRFRDeERRVUZESW4wPSJdfQ==