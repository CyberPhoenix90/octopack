export function parseArguments(args: string[]) {
	const list = args.filter((a) => !a.startsWith('-'));
	let arg: string = list.find((e) => e.includes('='));
	if (arg) {
		throw new Error(
			`Argument ${arg} cannot have a value, if you meant to pass ${arg} as a flag prefix it with - or --`
		);
	}

	return {
		raw: args,
		list,
		map: createArgumentMap(args)
	};
}

function createArgumentMap(args: string[]): { [key: string]: ArgumentValue } {
	const map: { [key: string]: ArgumentValue } = {};

	for (let arg of args) {
		if (arg.startsWith('-')) {
			if (arg.startsWith('--')) {
				arg = arg.substring(2);
			} else {
				arg = arg.substring(1);
			}
			if (arg.includes('=')) {
				const [key, value] = arg.split('=');
				map[key] = parseArgValue(value);
			} else {
				map[arg] = true;
			}
		}
	}

	return map;
}

function parseArgValue(value: string): ArgumentValue {
	if (parseFloat(value).toString() === value) {
		return parseFloat(value);
	} else if (value === 'true') {
		return true;
	} else if (value === 'false') {
		return false;
	} else if (value.includes('[') && value.indexOf(']')) {
		return value.substring(1, value.length - 1).split(',');
	} else {
		return value;
	}
}

export interface ParsedArguments {
	raw: string[];
	map: { [key: string]: ArgumentValue };
	list: string[];
}

export type ArgumentValue = number | boolean | string | string[];
