"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function parseArguments(args) {
    return {
        raw: args,
        list: args.filter((a) => !a.startsWith('-')),
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
    else {
        return value;
    }
}
//# sourceMappingURL=parser.js.map