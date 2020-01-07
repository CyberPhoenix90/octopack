"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ArrayUtils {
    static async flatMapAsync(array, cb) {
        const result = [];
        for (let i = 0; i < array.length; i++) {
            result.push(...(await cb(array[i], i, array)));
        }
        return result;
    }
    static async mapAsync(array, cb) {
        const result = [];
        for (let i = 0; i < array.length; i++) {
            result.push(await cb(array[i], i, array));
        }
        return result;
    }
    static async filterAsync(array, cb) {
        const result = [];
        for (let i = 0; i < array.length; i++) {
            if (await cb(array[i], i, array)) {
                result.push(array[i]);
            }
        }
        return result;
    }
    static async forEachAsync(array, cb) {
        for (let i = 0; i < array.length; i++) {
            await cb(array[i], i, array);
        }
    }
}
exports.arrayUtils = new ArrayUtils();
//# sourceMappingURL=array_utilities.js.map