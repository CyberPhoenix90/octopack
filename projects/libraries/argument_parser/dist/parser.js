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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGFyc2VyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicGFyc2VyLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsU0FBZ0IsY0FBYyxDQUFDLElBQWM7SUFDNUMsTUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDcEQsSUFBSSxHQUFHLEdBQVcsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ3BELElBQUksR0FBRyxFQUFFO1FBQ1IsTUFBTSxJQUFJLEtBQUssQ0FDZCxZQUFZLEdBQUcsOENBQThDLEdBQUcsbUNBQW1DLENBQ25HLENBQUM7S0FDRjtJQUVELE9BQU87UUFDTixHQUFHLEVBQUUsSUFBSTtRQUNULElBQUk7UUFDSixHQUFHLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDO0tBQzVCLENBQUM7QUFDSCxDQUFDO0FBZEQsd0NBY0M7QUFFRCxTQUFTLGlCQUFpQixDQUFDLElBQWM7SUFDeEMsTUFBTSxHQUFHLEdBQXFDLEVBQUUsQ0FBQztJQUVqRCxLQUFLLElBQUksR0FBRyxJQUFJLElBQUksRUFBRTtRQUNyQixJQUFJLEdBQUcsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLEVBQUU7WUFDeEIsSUFBSSxHQUFHLENBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxFQUFFO2dCQUN6QixHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2QjtpQkFBTTtnQkFDTixHQUFHLEdBQUcsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUN2QjtZQUNELElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsRUFBRTtnQkFDdEIsTUFBTSxDQUFDLEdBQUcsRUFBRSxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO2dCQUNwQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsYUFBYSxDQUFDLEtBQUssQ0FBQyxDQUFDO2FBQ2hDO2lCQUFNO2dCQUNOLEdBQUcsQ0FBQyxHQUFHLENBQUMsR0FBRyxJQUFJLENBQUM7YUFDaEI7U0FDRDtLQUNEO0lBRUQsT0FBTyxHQUFHLENBQUM7QUFDWixDQUFDO0FBRUQsU0FBUyxhQUFhLENBQUMsS0FBYTtJQUNuQyxJQUFJLFVBQVUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxRQUFRLEVBQUUsS0FBSyxLQUFLLEVBQUU7UUFDM0MsT0FBTyxVQUFVLENBQUMsS0FBSyxDQUFDLENBQUM7S0FDekI7U0FBTSxJQUFJLEtBQUssS0FBSyxNQUFNLEVBQUU7UUFDNUIsT0FBTyxJQUFJLENBQUM7S0FDWjtTQUFNLElBQUksS0FBSyxLQUFLLE9BQU8sRUFBRTtRQUM3QixPQUFPLEtBQUssQ0FBQztLQUNiO1NBQU0sSUFBSSxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUU7UUFDckQsT0FBTyxLQUFLLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxLQUFLLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUN2RDtTQUFNO1FBQ04sT0FBTyxLQUFLLENBQUM7S0FDYjtBQUNGLENBQUMifQ==