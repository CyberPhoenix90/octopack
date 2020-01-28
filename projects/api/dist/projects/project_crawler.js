"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const config_resolver_1 = require("config_resolver");
class ProjectCrawler {
    async findProjects(root, context) {
        if (!this.cache) {
            const result = [];
            await this.searchDirectory(result, root, context);
            this.cache = result;
        }
        return this.cache;
    }
    async searchDirectory(result, path, context) {
        if (await context.fileSystem.exists(path_1.join(path, config_resolver_1.OCTOPACK_CONFIG_FILE_NAME))) {
            const config = await config_resolver_1.loadConfig(path, context.fileSystem);
            if (config.scope === 'project' || config.isProject) {
                result.push({
                    path,
                    projectDependencies: new Set(),
                    rawConfig: config,
                    resolvedConfig: config_resolver_1.resolveConfig({
                        project: config,
                        workspace: context.workspaceConfig
                    })
                });
            }
            else {
                await this.crawSubfolders(context, path, result);
            }
        }
        else {
            await this.crawSubfolders(context, path, result);
        }
    }
    async crawSubfolders(context, path, result) {
        const directories = await context.fileSystem.getSubfolders(path);
        for (const dir of directories) {
            await this.searchDirectory(result, dir, context);
        }
    }
}
exports.ProjectCrawler = ProjectCrawler;
exports.projectCrawler = new ProjectCrawler();
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2plY3RfY3Jhd2xlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicHJvamVjdF9jcmF3bGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3QgcGF0aF8xID0gcmVxdWlyZShcInBhdGhcIik7XG5jb25zdCBjb25maWdfcmVzb2x2ZXJfMSA9IHJlcXVpcmUoXCJjb25maWdfcmVzb2x2ZXJcIik7XG5jbGFzcyBQcm9qZWN0Q3Jhd2xlciB7XG4gICAgYXN5bmMgZmluZFByb2plY3RzKHJvb3QsIGNvbnRleHQpIHtcbiAgICAgICAgaWYgKCF0aGlzLmNhY2hlKSB7XG4gICAgICAgICAgICBjb25zdCByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VhcmNoRGlyZWN0b3J5KHJlc3VsdCwgcm9vdCwgY29udGV4dCk7XG4gICAgICAgICAgICB0aGlzLmNhY2hlID0gcmVzdWx0O1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLmNhY2hlO1xuICAgIH1cbiAgICBhc3luYyBzZWFyY2hEaXJlY3RvcnkocmVzdWx0LCBwYXRoLCBjb250ZXh0KSB7XG4gICAgICAgIGlmIChhd2FpdCBjb250ZXh0LmZpbGVTeXN0ZW0uZXhpc3RzKHBhdGhfMS5qb2luKHBhdGgsIGNvbmZpZ19yZXNvbHZlcl8xLk9DVE9QQUNLX0NPTkZJR19GSUxFX05BTUUpKSkge1xuICAgICAgICAgICAgY29uc3QgY29uZmlnID0gYXdhaXQgY29uZmlnX3Jlc29sdmVyXzEubG9hZENvbmZpZyhwYXRoLCBjb250ZXh0LmZpbGVTeXN0ZW0pO1xuICAgICAgICAgICAgaWYgKGNvbmZpZy5zY29wZSA9PT0gJ3Byb2plY3QnIHx8IGNvbmZpZy5pc1Byb2plY3QpIHtcbiAgICAgICAgICAgICAgICByZXN1bHQucHVzaCh7XG4gICAgICAgICAgICAgICAgICAgIHBhdGgsXG4gICAgICAgICAgICAgICAgICAgIHByb2plY3REZXBlbmRlbmNpZXM6IG5ldyBTZXQoKSxcbiAgICAgICAgICAgICAgICAgICAgcmF3Q29uZmlnOiBjb25maWcsXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmVkQ29uZmlnOiBjb25maWdfcmVzb2x2ZXJfMS5yZXNvbHZlQ29uZmlnKHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHByb2plY3Q6IGNvbmZpZyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHdvcmtzcGFjZTogY29udGV4dC53b3Jrc3BhY2VDb25maWdcbiAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGF3YWl0IHRoaXMuY3Jhd1N1YmZvbGRlcnMoY29udGV4dCwgcGF0aCwgcmVzdWx0KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuY3Jhd1N1YmZvbGRlcnMoY29udGV4dCwgcGF0aCwgcmVzdWx0KTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBhc3luYyBjcmF3U3ViZm9sZGVycyhjb250ZXh0LCBwYXRoLCByZXN1bHQpIHtcbiAgICAgICAgY29uc3QgZGlyZWN0b3JpZXMgPSBhd2FpdCBjb250ZXh0LmZpbGVTeXN0ZW0uZ2V0U3ViZm9sZGVycyhwYXRoKTtcbiAgICAgICAgZm9yIChjb25zdCBkaXIgb2YgZGlyZWN0b3JpZXMpIHtcbiAgICAgICAgICAgIGF3YWl0IHRoaXMuc2VhcmNoRGlyZWN0b3J5KHJlc3VsdCwgZGlyLCBjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH1cbn1cbmV4cG9ydHMuUHJvamVjdENyYXdsZXIgPSBQcm9qZWN0Q3Jhd2xlcjtcbmV4cG9ydHMucHJvamVjdENyYXdsZXIgPSBuZXcgUHJvamVjdENyYXdsZXIoKTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNISnZhbVZqZEY5amNtRjNiR1Z5TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2ljSEp2YW1WamRGOWpjbUYzYkdWeUxtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPMEZCUVVFc0swSkJRVFJDTzBGQlF6VkNMSEZFUVVGMVJqdEJRVU4yUml4TlFVRmhMR05CUVdNN1NVRkRka0lzUzBGQlN5eERRVUZETEZsQlFWa3NRMEZCUXl4SlFVRkpMRVZCUVVVc1QwRkJUenRSUVVNMVFpeEpRVUZKTEVOQlFVTXNTVUZCU1N4RFFVRkRMRXRCUVVzc1JVRkJSVHRaUVVOaUxFMUJRVTBzVFVGQlRTeEhRVUZITEVWQlFVVXNRMEZCUXp0WlFVTnNRaXhOUVVGTkxFbEJRVWtzUTBGQlF5eGxRVUZsTEVOQlFVTXNUVUZCVFN4RlFVRkZMRWxCUVVrc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dFpRVU5zUkN4SlFVRkpMRU5CUVVNc1MwRkJTeXhIUVVGSExFMUJRVTBzUTBGQlF6dFRRVU4yUWp0UlFVTkVMRTlCUVU4c1NVRkJTU3hEUVVGRExFdEJRVXNzUTBGQlF6dEpRVU4wUWl4RFFVRkRPMGxCUTBRc1MwRkJTeXhEUVVGRExHVkJRV1VzUTBGQlF5eE5RVUZOTEVWQlFVVXNTVUZCU1N4RlFVRkZMRTlCUVU4N1VVRkRka01zU1VGQlNTeE5RVUZOTEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1RVRkJUU3hEUVVGRExGZEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNNa05CUVhsQ0xFTkJRVU1zUTBGQlF5eEZRVUZGTzFsQlEzaEZMRTFCUVUwc1RVRkJUU3hIUVVGSExFMUJRVTBzTkVKQlFWVXNRMEZCUXl4SlFVRkpMRVZCUVVVc1QwRkJUeXhEUVVGRExGVkJRVlVzUTBGQlF5eERRVUZETzFsQlF6RkVMRWxCUVVrc1RVRkJUU3hEUVVGRExFdEJRVXNzUzBGQlN5eFRRVUZUTEVsQlFVa3NUVUZCVFN4RFFVRkRMRk5CUVZNc1JVRkJSVHRuUWtGRGFFUXNUVUZCVFN4RFFVRkRMRWxCUVVrc1EwRkJRenR2UWtGRFVpeEpRVUZKTzI5Q1FVTktMRzFDUVVGdFFpeEZRVUZGTEVsQlFVa3NSMEZCUnl4RlFVRkZPMjlDUVVNNVFpeFRRVUZUTEVWQlFVVXNUVUZCVFR0dlFrRkRha0lzWTBGQll5eEZRVUZGTEN0Q1FVRmhMRU5CUVVNN2QwSkJRekZDTEU5QlFVOHNSVUZCUlN4TlFVRk5PM2RDUVVObUxGTkJRVk1zUlVGQlJTeFBRVUZQTEVOQlFVTXNaVUZCWlR0eFFrRkRja01zUTBGQlF6dHBRa0ZEVEN4RFFVRkRMRU5CUVVNN1lVRkRUanRwUWtGRFNUdG5Ra0ZEUkN4TlFVRk5MRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR5eEZRVUZGTEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJRenRoUVVOd1JEdFRRVU5LTzJGQlEwazdXVUZEUkN4TlFVRk5MRWxCUVVrc1EwRkJReXhqUVVGakxFTkJRVU1zVDBGQlR5eEZRVUZGTEVsQlFVa3NSVUZCUlN4TlFVRk5MRU5CUVVNc1EwRkJRenRUUVVOd1JEdEpRVU5NTEVOQlFVTTdTVUZEUkN4TFFVRkxMRU5CUVVNc1kwRkJZeXhEUVVGRExFOUJRVThzUlVGQlJTeEpRVUZKTEVWQlFVVXNUVUZCVFR0UlFVTjBReXhOUVVGTkxGZEJRVmNzUjBGQlJ5eE5RVUZOTEU5QlFVOHNRMEZCUXl4VlFVRlZMRU5CUVVNc1lVRkJZU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEycEZMRXRCUVVzc1RVRkJUU3hIUVVGSExFbEJRVWtzVjBGQlZ5eEZRVUZGTzFsQlF6TkNMRTFCUVUwc1NVRkJTU3hEUVVGRExHVkJRV1VzUTBGQlF5eE5RVUZOTEVWQlFVVXNSMEZCUnl4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8xTkJRM0JFTzBsQlEwd3NRMEZCUXp0RFFVTktPMEZCY2tORUxIZERRWEZEUXp0QlFVTlpMRkZCUVVFc1kwRkJZeXhIUVVGSExFbEJRVWtzWTBGQll5eEZRVUZGTEVOQlFVTWlmUT09Il19