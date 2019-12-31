export function parseArguments(args: string[]) {
	return {
		raw: args,
		list: args.filter((a) => !a.startsWith('-')),
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
	} else {
		return value;
	}
}

export interface ParsedArguments {
	raw: string[];
	map: { [key: string]: ArgumentValue };
	list: string[];
}

export type ArgumentValue = number | boolean | string;
