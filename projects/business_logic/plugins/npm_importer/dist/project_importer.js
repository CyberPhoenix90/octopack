"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const static_analyser_1 = require("static_analyser");
const typescript_1 = require("typescript");
function projectImporter(args) {
    return async (model, context) => {
        context.uiLogger.info(`[${model.project.resolvedConfig.name}]Mapping project imports`);
        for (const file of model.input) {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.jsx')) {
                await findDependencies(file, model);
            }
        }
        return model;
    };
}
exports.projectImporter = projectImporter;
async function findDependencies(file, model) {
    const fm = new static_analyser_1.FileManipulator(await model.fileSystem.readFile(file, 'utf8'));
    fm.queryAst((node) => {
        if (typescript_1.isImportDeclaration(node)) {
            if (node.moduleSpecifier) {
                const moduleName = node.moduleSpecifier.text;
                if (!moduleName.startsWith('.')) {
                    const [name] = moduleName.split('/');
                    const target = model.allProjects.find((p) => p.resolvedConfig.name === name);
                    if (target) {
                        model.project.projectDependencies.add(target);
                    }
                }
            }
            return [];
        }
        else {
            return [];
        }
    });
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInByb2plY3RfaW1wb3J0ZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJwcm9qZWN0X2ltcG9ydGVyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuY29uc3Qgc3RhdGljX2FuYWx5c2VyXzEgPSByZXF1aXJlKFwic3RhdGljX2FuYWx5c2VyXCIpO1xuY29uc3QgdHlwZXNjcmlwdF8xID0gcmVxdWlyZShcInR5cGVzY3JpcHRcIik7XG5mdW5jdGlvbiBwcm9qZWN0SW1wb3J0ZXIoYXJncykge1xuICAgIHJldHVybiBhc3luYyAobW9kZWwsIGNvbnRleHQpID0+IHtcbiAgICAgICAgY29udGV4dC51aUxvZ2dlci5pbmZvKGBbJHttb2RlbC5wcm9qZWN0LnJlc29sdmVkQ29uZmlnLm5hbWV9XU1hcHBpbmcgcHJvamVjdCBpbXBvcnRzYCk7XG4gICAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBtb2RlbC5pbnB1dCkge1xuICAgICAgICAgICAgaWYgKGZpbGUuZW5kc1dpdGgoJy50cycpIHx8IGZpbGUuZW5kc1dpdGgoJy50c3gnKSB8fCBmaWxlLmVuZHNXaXRoKCcuanMnKSB8fCBmaWxlLmVuZHNXaXRoKCcuanN4JykpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBmaW5kRGVwZW5kZW5jaWVzKGZpbGUsIG1vZGVsKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbW9kZWw7XG4gICAgfTtcbn1cbmV4cG9ydHMucHJvamVjdEltcG9ydGVyID0gcHJvamVjdEltcG9ydGVyO1xuYXN5bmMgZnVuY3Rpb24gZmluZERlcGVuZGVuY2llcyhmaWxlLCBtb2RlbCkge1xuICAgIGNvbnN0IGZtID0gbmV3IHN0YXRpY19hbmFseXNlcl8xLkZpbGVNYW5pcHVsYXRvcihhd2FpdCBtb2RlbC5maWxlU3lzdGVtLnJlYWRGaWxlKGZpbGUsICd1dGY4JykpO1xuICAgIGZtLnF1ZXJ5QXN0KChub2RlKSA9PiB7XG4gICAgICAgIGlmICh0eXBlc2NyaXB0XzEuaXNJbXBvcnREZWNsYXJhdGlvbihub2RlKSkge1xuICAgICAgICAgICAgaWYgKG5vZGUubW9kdWxlU3BlY2lmaWVyKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbW9kdWxlTmFtZSA9IG5vZGUubW9kdWxlU3BlY2lmaWVyLnRleHQ7XG4gICAgICAgICAgICAgICAgaWYgKCFtb2R1bGVOYW1lLnN0YXJ0c1dpdGgoJy4nKSkge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBbbmFtZV0gPSBtb2R1bGVOYW1lLnNwbGl0KCcvJyk7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IHRhcmdldCA9IG1vZGVsLmFsbFByb2plY3RzLmZpbmQoKHApID0+IHAucmVzb2x2ZWRDb25maWcubmFtZSA9PT0gbmFtZSk7XG4gICAgICAgICAgICAgICAgICAgIGlmICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG1vZGVsLnByb2plY3QucHJvamVjdERlcGVuZGVuY2llcy5hZGQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuICAgIH0pO1xufVxuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pY0hKdmFtVmpkRjlwYlhCdmNuUmxjaTVxY3lJc0luTnZkWEpqWlZKdmIzUWlPaUlpTENKemIzVnlZMlZ6SWpwYkluQnliMnBsWTNSZmFXMXdiM0owWlhJdWFuTWlYU3dpYm1GdFpYTWlPbHRkTENKdFlYQndhVzVuY3lJNklqczdRVUZCUVN4eFJFRkJhMFE3UVVGRGJFUXNNa05CUVdsRU8wRkJRMnBFTEZOQlFXZENMR1ZCUVdVc1EwRkJReXhKUVVGSk8wbEJRMmhETEU5QlFVOHNTMEZCU3l4RlFVRkZMRXRCUVVzc1JVRkJSU3hQUVVGUExFVkJRVVVzUlVGQlJUdFJRVU0xUWl4UFFVRlBMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEV0QlFVc3NRMEZCUXl4UFFVRlBMRU5CUVVNc1kwRkJZeXhEUVVGRExFbEJRVWtzTUVKQlFUQkNMRU5CUVVNc1EwRkJRenRSUVVOMlJpeExRVUZMTEUxQlFVMHNTVUZCU1N4SlFVRkpMRXRCUVVzc1EwRkJReXhMUVVGTExFVkJRVVU3V1VGRE5VSXNTVUZCU1N4SlFVRkpMRU5CUVVNc1VVRkJVU3hEUVVGRExFdEJRVXNzUTBGQlF5eEpRVUZKTEVsQlFVa3NRMEZCUXl4UlFVRlJMRU5CUVVNc1RVRkJUU3hEUVVGRExFbEJRVWtzU1VGQlNTeERRVUZETEZGQlFWRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1NVRkJTU3hKUVVGSkxFTkJRVU1zVVVGQlVTeERRVUZETEUxQlFVMHNRMEZCUXl4RlFVRkZPMmRDUVVOb1J5eE5RVUZOTEdkQ1FVRm5RaXhEUVVGRExFbEJRVWtzUlVGQlJTeExRVUZMTEVOQlFVTXNRMEZCUXp0aFFVTjJRenRUUVVOS08xRkJRMFFzVDBGQlR5eExRVUZMTEVOQlFVTTdTVUZEYWtJc1EwRkJReXhEUVVGRE8wRkJRMDRzUTBGQlF6dEJRVlpFTERCRFFWVkRPMEZCUTBRc1MwRkJTeXhWUVVGVkxHZENRVUZuUWl4RFFVRkRMRWxCUVVrc1JVRkJSU3hMUVVGTE8wbEJRM1pETEUxQlFVMHNSVUZCUlN4SFFVRkhMRWxCUVVrc2FVTkJRV1VzUTBGQlF5eE5RVUZOTEV0QlFVc3NRMEZCUXl4VlFVRlZMRU5CUVVNc1VVRkJVU3hEUVVGRExFbEJRVWtzUlVGQlJTeE5RVUZOTEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpsRkxFVkJRVVVzUTBGQlF5eFJRVUZSTEVOQlFVTXNRMEZCUXl4SlFVRkpMRVZCUVVVc1JVRkJSVHRSUVVOcVFpeEpRVUZKTEdkRFFVRnRRaXhEUVVGRExFbEJRVWtzUTBGQlF5eEZRVUZGTzFsQlF6TkNMRWxCUVVrc1NVRkJTU3hEUVVGRExHVkJRV1VzUlVGQlJUdG5Ra0ZEZEVJc1RVRkJUU3hWUVVGVkxFZEJRVWNzU1VGQlNTeERRVUZETEdWQlFXVXNRMEZCUXl4SlFVRkpMRU5CUVVNN1owSkJRemRETEVsQlFVa3NRMEZCUXl4VlFVRlZMRU5CUVVNc1ZVRkJWU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTzI5Q1FVTTNRaXhOUVVGTkxFTkJRVU1zU1VGQlNTeERRVUZETEVkQlFVY3NWVUZCVlN4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dHZRa0ZEY2tNc1RVRkJUU3hOUVVGTkxFZEJRVWNzUzBGQlN5eERRVUZETEZkQlFWY3NRMEZCUXl4SlFVRkpMRU5CUVVNc1EwRkJReXhEUVVGRExFVkJRVVVzUlVGQlJTeERRVUZETEVOQlFVTXNRMEZCUXl4alFVRmpMRU5CUVVNc1NVRkJTU3hMUVVGTExFbEJRVWtzUTBGQlF5eERRVUZETzI5Q1FVTTNSU3hKUVVGSkxFMUJRVTBzUlVGQlJUdDNRa0ZEVWl4TFFVRkxMRU5CUVVNc1QwRkJUeXhEUVVGRExHMUNRVUZ0UWl4RFFVRkRMRWRCUVVjc1EwRkJReXhOUVVGTkxFTkJRVU1zUTBGQlF6dHhRa0ZEYWtRN2FVSkJRMG83WVVGRFNqdFpRVU5FTEU5QlFVOHNSVUZCUlN4RFFVRkRPMU5CUTJJN1lVRkRTVHRaUVVORUxFOUJRVThzUlVGQlJTeERRVUZETzFOQlEySTdTVUZEVEN4RFFVRkRMRU5CUVVNc1EwRkJRenRCUVVOUUxFTkJRVU1pZlE9PSJdfQ==