"use strict";
function __export(m) {
    for (var p in m) if (!exports.hasOwnProperty(p)) exports[p] = m[p];
}
Object.defineProperty(exports, "__esModule", { value: true });
const importData = { 'models': '../../../models', 'static_analyser': '../../../../libraries/static_analyser' };
const mod = require('module');
const original = mod.prototype.require;
mod.prototype.require = function (path, ...args) {
    if (importData[path]) {
        path = importData[path];
        return original.call(module, path, ...args);
    }
    else {
        return original.call(this, path, ...args);
    }
};
__export(require("./barrel_file"));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImluZGV4LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuZnVuY3Rpb24gX19leHBvcnQobSkge1xuICAgIGZvciAodmFyIHAgaW4gbSkgaWYgKCFleHBvcnRzLmhhc093blByb3BlcnR5KHApKSBleHBvcnRzW3BdID0gbVtwXTtcbn1cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmNvbnN0IGltcG9ydERhdGEgPSB7ICdtb2RlbHMnOiAnLi4vLi4vLi4vbW9kZWxzJywgJ3N0YXRpY19hbmFseXNlcic6ICcuLi8uLi8uLi8uLi9saWJyYXJpZXMvc3RhdGljX2FuYWx5c2VyJyB9O1xuY29uc3QgbW9kID0gcmVxdWlyZSgnbW9kdWxlJyk7XG5jb25zdCBvcmlnaW5hbCA9IG1vZC5wcm90b3R5cGUucmVxdWlyZTtcbm1vZC5wcm90b3R5cGUucmVxdWlyZSA9IGZ1bmN0aW9uIChwYXRoLCAuLi5hcmdzKSB7XG4gICAgaWYgKGltcG9ydERhdGFbcGF0aF0pIHtcbiAgICAgICAgcGF0aCA9IGltcG9ydERhdGFbcGF0aF07XG4gICAgICAgIHJldHVybiBvcmlnaW5hbC5jYWxsKG1vZHVsZSwgcGF0aCwgLi4uYXJncyk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gb3JpZ2luYWwuY2FsbCh0aGlzLCBwYXRoLCAuLi5hcmdzKTtcbiAgICB9XG59O1xuX19leHBvcnQocmVxdWlyZShcIi4vYmFycmVsX2ZpbGVcIikpO1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9ZGF0YTphcHBsaWNhdGlvbi9qc29uO2Jhc2U2NCxleUoyWlhKemFXOXVJam96TENKbWFXeGxJam9pYVc1a1pYZ3Vhbk1pTENKemIzVnlZMlZTYjI5MElqb2lJaXdpYzI5MWNtTmxjeUk2V3lKcGJtUmxlQzVxY3lKZExDSnVZVzFsY3lJNlcxMHNJbTFoY0hCcGJtZHpJam9pT3pzN096dEJRVU5CTEUxQlFVMHNWVUZCVlN4SFFVRkhMRVZCUVVNc1VVRkJVU3hGUVVGRkxHbENRVUZwUWl4RlFVRkRMR2xDUVVGcFFpeEZRVUZGTEhWRFFVRjFReXhGUVVGRExFTkJRVUU3UVVGRE0wY3NUVUZCVFN4SFFVRkhMRWRCUVVjc1QwRkJUeXhEUVVGRExGRkJRVkVzUTBGQlF5eERRVUZETzBGQlJUbENMRTFCUVUwc1VVRkJVU3hIUVVGSExFZEJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTXNUMEZCVHl4RFFVRkRPMEZCUTNaRExFZEJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTXNUMEZCVHl4SFFVRkhMRlZCUVZNc1NVRkJTU3hGUVVGRkxFZEJRVWNzU1VGQlNUdEpRVU0zUXl4SlFVRkpMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJUdFJRVU55UWl4SlFVRkpMRWRCUVVjc1ZVRkJWU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETzFGQlEzaENMRTlCUVU4c1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eE5RVUZOTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU03UzBGRE5VTTdVMEZCVFR0UlFVTk9MRTlCUVU4c1VVRkJVU3hEUVVGRExFbEJRVWtzUTBGQlF5eEpRVUZKTEVWQlFVVXNTVUZCU1N4RlFVRkZMRWRCUVVjc1NVRkJTU3hEUVVGRExFTkJRVU03UzBGRE1VTTdRVUZEUml4RFFVRkRMRU5CUVVNN1FVRkZSaXh0UTBGQk9FSWlmUT09Il19