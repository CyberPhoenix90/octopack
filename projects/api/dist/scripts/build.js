"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const compiler_1 = require("compiler");
const project_crawler_1 = require("../projects/project_crawler");
const project_selector_1 = require("../projects/project_selector");
const script_1 = require("./script");
class Build extends script_1.Script {
    autoComplete() {
        throw new Error('Method not implemented.');
    }
    help() {
        return {
            description: 'Builds stuff'
        };
    }
    async run(args, context) {
        const allProjects = await project_crawler_1.projectCrawler.findProjects(context.workspaceRoot, context);
        const selectedProjects = project_selector_1.getSelectedProjects(args.list, allProjects, context);
        if (selectedProjects.length) {
            await compiler_1.compiler.compile(selectedProjects, allProjects, context, args);
        }
        else {
            context.uiLogger.error('None of the provided names were matching a project. Not building.');
        }
        return {};
    }
}
exports.Build = Build;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImJ1aWxkLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiYnVpbGQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgXCJfX2VzTW9kdWxlXCIsIHsgdmFsdWU6IHRydWUgfSk7XG5jb25zdCBjb21waWxlcl8xID0gcmVxdWlyZShcImNvbXBpbGVyXCIpO1xuY29uc3QgcHJvamVjdF9jcmF3bGVyXzEgPSByZXF1aXJlKFwiLi4vcHJvamVjdHMvcHJvamVjdF9jcmF3bGVyXCIpO1xuY29uc3QgcHJvamVjdF9zZWxlY3Rvcl8xID0gcmVxdWlyZShcIi4uL3Byb2plY3RzL3Byb2plY3Rfc2VsZWN0b3JcIik7XG5jb25zdCBzY3JpcHRfMSA9IHJlcXVpcmUoXCIuL3NjcmlwdFwiKTtcbmNsYXNzIEJ1aWxkIGV4dGVuZHMgc2NyaXB0XzEuU2NyaXB0IHtcbiAgICBhdXRvQ29tcGxldGUoKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignTWV0aG9kIG5vdCBpbXBsZW1lbnRlZC4nKTtcbiAgICB9XG4gICAgaGVscCgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGRlc2NyaXB0aW9uOiAnQnVpbGRzIHN0dWZmJ1xuICAgICAgICB9O1xuICAgIH1cbiAgICBhc3luYyBydW4oYXJncywgY29udGV4dCkge1xuICAgICAgICBjb25zdCBhbGxQcm9qZWN0cyA9IGF3YWl0IHByb2plY3RfY3Jhd2xlcl8xLnByb2plY3RDcmF3bGVyLmZpbmRQcm9qZWN0cyhjb250ZXh0LndvcmtzcGFjZVJvb3QsIGNvbnRleHQpO1xuICAgICAgICBjb25zdCBzZWxlY3RlZFByb2plY3RzID0gcHJvamVjdF9zZWxlY3Rvcl8xLmdldFNlbGVjdGVkUHJvamVjdHMoYXJncy5saXN0LCBhbGxQcm9qZWN0cywgY29udGV4dCk7XG4gICAgICAgIGlmIChzZWxlY3RlZFByb2plY3RzLmxlbmd0aCkge1xuICAgICAgICAgICAgYXdhaXQgY29tcGlsZXJfMS5jb21waWxlci5jb21waWxlKHNlbGVjdGVkUHJvamVjdHMsIGFsbFByb2plY3RzLCBjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnRleHQudWlMb2dnZXIuZXJyb3IoJ05vbmUgb2YgdGhlIHByb3ZpZGVkIG5hbWVzIHdlcmUgbWF0Y2hpbmcgYSBwcm9qZWN0LiBOb3QgYnVpbGRpbmcuJyk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHt9O1xuICAgIH1cbn1cbmV4cG9ydHMuQnVpbGQgPSBCdWlsZDtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaVluVnBiR1F1YW5NaUxDSnpiM1Z5WTJWU2IyOTBJam9pSWl3aWMyOTFjbU5sY3lJNld5SmlkV2xzWkM1cWN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaU96dEJRVUZCTEhWRFFVRnZRenRCUVVOd1F5eHBSVUZCTmtRN1FVRkROMFFzYlVWQlFXMUZPMEZCUTI1RkxIRkRRVUZyUXp0QlFVTnNReXhOUVVGaExFdEJRVTBzVTBGQlVTeGxRVUZOTzBsQlF6ZENMRmxCUVZrN1VVRkRVaXhOUVVGTkxFbEJRVWtzUzBGQlN5eERRVUZETEhsQ1FVRjVRaXhEUVVGRExFTkJRVU03U1VGREwwTXNRMEZCUXp0SlFVTkVMRWxCUVVrN1VVRkRRU3hQUVVGUE8xbEJRMGdzVjBGQlZ5eEZRVUZGTEdOQlFXTTdVMEZET1VJc1EwRkJRenRKUVVOT0xFTkJRVU03U1VGRFJDeExRVUZMTEVOQlFVTXNSMEZCUnl4RFFVRkRMRWxCUVVrc1JVRkJSU3hQUVVGUE8xRkJRMjVDTEUxQlFVMHNWMEZCVnl4SFFVRkhMRTFCUVUwc1owTkJRV01zUTBGQlF5eFpRVUZaTEVOQlFVTXNUMEZCVHl4RFFVRkRMR0ZCUVdFc1JVRkJSU3hQUVVGUExFTkJRVU1zUTBGQlF6dFJRVU4wUml4TlFVRk5MR2RDUVVGblFpeEhRVUZITEhORFFVRnRRaXhEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNWMEZCVnl4RlFVRkZMRTlCUVU4c1EwRkJReXhEUVVGRE8xRkJRemxGTEVsQlFVa3NaMEpCUVdkQ0xFTkJRVU1zVFVGQlRTeEZRVUZGTzFsQlEzcENMRTFCUVUwc2JVSkJRVkVzUTBGQlF5eFBRVUZQTEVOQlFVTXNaMEpCUVdkQ0xFVkJRVVVzVjBGQlZ5eEZRVUZGTEU5QlFVOHNSVUZCUlN4SlFVRkpMRU5CUVVNc1EwRkJRenRUUVVONFJUdGhRVU5KTzFsQlEwUXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhMUVVGTExFTkJRVU1zYlVWQlFXMUZMRU5CUVVNc1EwRkJRenRUUVVNdlJqdFJRVU5FTEU5QlFVOHNSVUZCUlN4RFFVRkRPMGxCUTJRc1EwRkJRenREUVVOS08wRkJjRUpFTEhOQ1FXOUNReUo5Il19