"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class ObjectUtils {
    deepAssign(...args) {
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
                    target[key] = source[key];
                }
                else if (key in target && key in source) {
                    //@ts-ignore
                    if (typeof target[key] === 'object' && typeof source[key] === 'object') {
                        //@ts-ignore
                        this.deepAssign(target[key], source[key]);
                    }
                    else {
                        //@ts-ignore
                        target[key] = source[key];
                    }
                }
            }
        }
        return target;
    }
}
exports.objectUtils = new ObjectUtils();
//# sourceMappingURL=object_utilities.js.map