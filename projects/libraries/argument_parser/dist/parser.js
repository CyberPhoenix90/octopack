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