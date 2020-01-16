class ObjectUtils {
	public deepAssign<T>(...args: T[]): T {
		const target = args[0];
		if (args.length <= 1) {
			return target;
		}
		if (args[0] === undefined || args[0] === null) {
			throw new Error('Cannot assign unto undefined or null');
		}
		args = args.filter((p) => p);

		//Get all unique keys among all objects
		const keys = args.flatMap(Object.keys).filter((e, index, arr) => arr.lastIndexOf(e) === arr.indexOf(e, index));

		for (const key of keys) {
			for (const source of args) {
				if (source === target) {
					continue;
				}

				if (key in source && !(key in target)) {
					//@ts-ignore
					this.simpleAssign<T>(key, source, target);
				} else if (key in target && key in source) {
					if (
						//@ts-ignore
						typeof target[key] === 'object' &&
						//@ts-ignore
						typeof source[key] === 'object' &&
						//@ts-ignore
						!Array.isArray(target[key]) &&
						//@ts-ignore
						!Array.isArray(source[key])
					) {
						//@ts-ignore
						this.deepAssign(target[key], source[key]);
					} else {
						//@ts-ignore
						this.simpleAssign<T>(key, source, target);
					}
				}
			}
		}

		return target;
	}

	private simpleAssign<T>(key: string, source: T, target: T) {
		//@ts-ignore
		if (typeof source[key] === 'object') {
			//@ts-ignore
			if (Array.isArray(source[key])) {
				//@ts-ignore
				target[key] = source[key].slice();
			} else {
				//@ts-ignore
				target[key] = {};
				//@ts-ignore
				this.deepAssign(target[key], source[key]);
			}
		} else {
			//@ts-ignore
			target[key] = source[key];
		}
	}
}

export const objectUtils: ObjectUtils = new ObjectUtils();
