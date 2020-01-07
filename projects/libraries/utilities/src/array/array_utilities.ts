class ArrayUtils {
	public static async flatMapAsync<T, M>(
		array: T[],
		cb: (item: T, index: number, array: T[]) => Promise<M[]>
	): Promise<M[]> {
		const result: M[] = [];

		for (let i = 0; i < array.length; i++) {
			result.push(...(await cb(array[i], i, array)));
		}

		return result;
	}

	public static async mapAsync<T, M>(
		array: T[],
		cb: (item: T, index: number, array: T[]) => Promise<M>
	): Promise<M[]> {
		const result: M[] = [];

		for (let i = 0; i < array.length; i++) {
			result.push(await cb(array[i], i, array));
		}

		return result;
	}

	public static async filterAsync<T>(
		array: T[],
		cb: (item: T, index: number, array: T[]) => Promise<boolean>
	): Promise<T[]> {
		const result: T[] = [];

		for (let i = 0; i < array.length; i++) {
			if (await cb(array[i], i, array)) {
				result.push(array[i]);
			}
		}

		return result;
	}

	public static async forEachAsync<T>(
		array: T[],
		cb: (item: T, index: number, array: T[]) => Promise<T>
	): Promise<void> {
		for (let i = 0; i < array.length; i++) {
			await cb(array[i], i, array);
		}
	}
}

export const arrayUtils: ArrayUtils = new ArrayUtils();
