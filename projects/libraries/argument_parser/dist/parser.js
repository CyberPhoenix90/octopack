"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseArguments(args) {
    const list = args.filter((a) => !a.startsWith('-'));
    let arg = list.find((e) => e.includes('='));
    if (arg) {
        throw new Error(`Argument ${arg} cannot have a value, if you meant to pass ${arg} as a flag prefix it with - or --`);
    }
    return {
        raw: args,
        list,
        map: createArgumentMap(args)
    };
}
exports.parseArguments = parseArguments;
function createArgumentMap(args) {
    const map = {};
    for (let arg of args) {
        if (arg.startsWith('-')) {
            if (arg.startsWith('--')) {
                arg = arg.substring(2);
            }
            else {
                arg = arg.substring(1);
            }
            if (arg.includes('=')) {
                const [key, value] = arg.split('=');
                map[key] = parseArgValue(value);
            }
            else {
                map[arg] = true;
            }
        }
    }
    return map;
}
function parseArgValue(value) {
    if (parseFloat(value).toString() === value) {
        return parseFloat(value);
    }
    else if (value === 'true') {
        return true;
    }
    else if (value === 'false') {
        return false;
    }
    else if (value.includes('[') && value.indexOf(']')) {
        return value.substring(1, value.length - 1).split(',');
    }
    else {
        return value;
    }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhcnNlci5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIlwidXNlIHN0cmljdFwiO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFwiX19lc01vZHVsZVwiLCB7IHZhbHVlOiB0cnVlIH0pO1xuZnVuY3Rpb24gcGFyc2VBcmd1bWVudHMoYXJncykge1xuICAgIGNvbnN0IGxpc3QgPSBhcmdzLmZpbHRlcigoYSkgPT4gIWEuc3RhcnRzV2l0aCgnLScpKTtcbiAgICBsZXQgYXJnID0gbGlzdC5maW5kKChlKSA9PiBlLmluY2x1ZGVzKCc9JykpO1xuICAgIGlmIChhcmcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBBcmd1bWVudCAke2FyZ30gY2Fubm90IGhhdmUgYSB2YWx1ZSwgaWYgeW91IG1lYW50IHRvIHBhc3MgJHthcmd9IGFzIGEgZmxhZyBwcmVmaXggaXQgd2l0aCAtIG9yIC0tYCk7XG4gICAgfVxuICAgIHJldHVybiB7XG4gICAgICAgIHJhdzogYXJncyxcbiAgICAgICAgbGlzdCxcbiAgICAgICAgbWFwOiBjcmVhdGVBcmd1bWVudE1hcChhcmdzKVxuICAgIH07XG59XG5leHBvcnRzLnBhcnNlQXJndW1lbnRzID0gcGFyc2VBcmd1bWVudHM7XG5mdW5jdGlvbiBjcmVhdGVBcmd1bWVudE1hcChhcmdzKSB7XG4gICAgY29uc3QgbWFwID0ge307XG4gICAgZm9yIChsZXQgYXJnIG9mIGFyZ3MpIHtcbiAgICAgICAgaWYgKGFyZy5zdGFydHNXaXRoKCctJykpIHtcbiAgICAgICAgICAgIGlmIChhcmcuc3RhcnRzV2l0aCgnLS0nKSkge1xuICAgICAgICAgICAgICAgIGFyZyA9IGFyZy5zdWJzdHJpbmcoMik7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICBhcmcgPSBhcmcuc3Vic3RyaW5nKDEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKGFyZy5pbmNsdWRlcygnPScpKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgW2tleSwgdmFsdWVdID0gYXJnLnNwbGl0KCc9Jyk7XG4gICAgICAgICAgICAgICAgbWFwW2tleV0gPSBwYXJzZUFyZ1ZhbHVlKHZhbHVlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIG1hcFthcmddID0gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gbWFwO1xufVxuZnVuY3Rpb24gcGFyc2VBcmdWYWx1ZSh2YWx1ZSkge1xuICAgIGlmIChwYXJzZUZsb2F0KHZhbHVlKS50b1N0cmluZygpID09PSB2YWx1ZSkge1xuICAgICAgICByZXR1cm4gcGFyc2VGbG9hdCh2YWx1ZSk7XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlID09PSAndHJ1ZScpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIGVsc2UgaWYgKHZhbHVlID09PSAnZmFsc2UnKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgZWxzZSBpZiAodmFsdWUuaW5jbHVkZXMoJ1snKSAmJiB2YWx1ZS5pbmRleE9mKCddJykpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlLnN1YnN0cmluZygxLCB2YWx1ZS5sZW5ndGggLSAxKS5zcGxpdCgnLCcpO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn1cbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNHRnljMlZ5TG1weklpd2ljMjkxY21ObFVtOXZkQ0k2SWlJc0luTnZkWEpqWlhNaU9sc2ljR0Z5YzJWeUxtcHpJbDBzSW01aGJXVnpJanBiWFN3aWJXRndjR2x1WjNNaU9pSTdPMEZCUVVFc1UwRkJaMElzWTBGQll5eERRVUZETEVsQlFVazdTVUZETDBJc1RVRkJUU3hKUVVGSkxFZEJRVWNzU1VGQlNTeERRVUZETEUxQlFVMHNRMEZCUXl4RFFVRkRMRU5CUVVNc1JVRkJSU3hGUVVGRkxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU03U1VGRGNFUXNTVUZCU1N4SFFVRkhMRWRCUVVjc1NVRkJTU3hEUVVGRExFbEJRVWtzUTBGQlF5eERRVUZETEVOQlFVTXNSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJReXhEUVVGRExGRkJRVkVzUTBGQlF5eEhRVUZITEVOQlFVTXNRMEZCUXl4RFFVRkRPMGxCUXpWRExFbEJRVWtzUjBGQlJ5eEZRVUZGTzFGQlEwd3NUVUZCVFN4SlFVRkpMRXRCUVVzc1EwRkJReXhaUVVGWkxFZEJRVWNzT0VOQlFUaERMRWRCUVVjc2JVTkJRVzFETEVOQlFVTXNRMEZCUXp0TFFVTjRTRHRKUVVORUxFOUJRVTg3VVVGRFNDeEhRVUZITEVWQlFVVXNTVUZCU1R0UlFVTlVMRWxCUVVrN1VVRkRTaXhIUVVGSExFVkJRVVVzYVVKQlFXbENMRU5CUVVNc1NVRkJTU3hEUVVGRE8wdEJReTlDTEVOQlFVTTdRVUZEVGl4RFFVRkRPMEZCV0VRc2QwTkJWME03UVVGRFJDeFRRVUZUTEdsQ1FVRnBRaXhEUVVGRExFbEJRVWs3U1VGRE0wSXNUVUZCVFN4SFFVRkhMRWRCUVVjc1JVRkJSU3hEUVVGRE8wbEJRMllzUzBGQlN5eEpRVUZKTEVkQlFVY3NTVUZCU1N4SlFVRkpMRVZCUVVVN1VVRkRiRUlzU1VGQlNTeEhRVUZITEVOQlFVTXNWVUZCVlN4RFFVRkRMRWRCUVVjc1EwRkJReXhGUVVGRk8xbEJRM0pDTEVsQlFVa3NSMEZCUnl4RFFVRkRMRlZCUVZVc1EwRkJReXhKUVVGSkxFTkJRVU1zUlVGQlJUdG5Ra0ZEZEVJc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkRNVUk3YVVKQlEwazdaMEpCUTBRc1IwRkJSeXhIUVVGSExFZEJRVWNzUTBGQlF5eFRRVUZUTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNN1lVRkRNVUk3V1VGRFJDeEpRVUZKTEVkQlFVY3NRMEZCUXl4UlFVRlJMRU5CUVVNc1IwRkJSeXhEUVVGRExFVkJRVVU3WjBKQlEyNUNMRTFCUVUwc1EwRkJReXhIUVVGSExFVkJRVVVzUzBGQlN5eERRVUZETEVkQlFVY3NSMEZCUnl4RFFVRkRMRXRCUVVzc1EwRkJReXhIUVVGSExFTkJRVU1zUTBGQlF6dG5Ra0ZEY0VNc1IwRkJSeXhEUVVGRExFZEJRVWNzUTBGQlF5eEhRVUZITEdGQlFXRXNRMEZCUXl4TFFVRkxMRU5CUVVNc1EwRkJRenRoUVVOdVF6dHBRa0ZEU1R0blFrRkRSQ3hIUVVGSExFTkJRVU1zUjBGQlJ5eERRVUZETEVkQlFVY3NTVUZCU1N4RFFVRkRPMkZCUTI1Q08xTkJRMG83UzBGRFNqdEpRVU5FTEU5QlFVOHNSMEZCUnl4RFFVRkRPMEZCUTJZc1EwRkJRenRCUVVORUxGTkJRVk1zWVVGQllTeERRVUZETEV0QlFVczdTVUZEZUVJc1NVRkJTU3hWUVVGVkxFTkJRVU1zUzBGQlN5eERRVUZETEVOQlFVTXNVVUZCVVN4RlFVRkZMRXRCUVVzc1MwRkJTeXhGUVVGRk8xRkJRM2hETEU5QlFVOHNWVUZCVlN4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRE8wdEJRelZDTzFOQlEwa3NTVUZCU1N4TFFVRkxMRXRCUVVzc1RVRkJUU3hGUVVGRk8xRkJRM1pDTEU5QlFVOHNTVUZCU1N4RFFVRkRPMHRCUTJZN1UwRkRTU3hKUVVGSkxFdEJRVXNzUzBGQlN5eFBRVUZQTEVWQlFVVTdVVUZEZUVJc1QwRkJUeXhMUVVGTExFTkJRVU03UzBGRGFFSTdVMEZEU1N4SlFVRkpMRXRCUVVzc1EwRkJReXhSUVVGUkxFTkJRVU1zUjBGQlJ5eERRVUZETEVsQlFVa3NTMEZCU3l4RFFVRkRMRTlCUVU4c1EwRkJReXhIUVVGSExFTkJRVU1zUlVGQlJUdFJRVU5vUkN4UFFVRlBMRXRCUVVzc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlF5eEZRVUZGTEV0QlFVc3NRMEZCUXl4TlFVRk5MRWRCUVVjc1EwRkJReXhEUVVGRExFTkJRVU1zUzBGQlN5eERRVUZETEVkQlFVY3NRMEZCUXl4RFFVRkRPMHRCUXpGRU8xTkJRMGs3VVVGRFJDeFBRVUZQTEV0QlFVc3NRMEZCUXp0TFFVTm9RanRCUVVOTUxFTkJRVU1pZlE9PSJdfQ==