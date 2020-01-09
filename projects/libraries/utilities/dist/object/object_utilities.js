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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoib2JqZWN0X3V0aWxpdGllcy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIm9iamVjdF91dGlsaXRpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxNQUFNLFdBQVc7SUFDVCxVQUFVLENBQUksR0FBRyxJQUFTO1FBQ2hDLE1BQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUN2QixJQUFJLElBQUksQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO1lBQ3JCLE9BQU8sTUFBTSxDQUFDO1NBQ2Q7UUFDRCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxTQUFTLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLElBQUksRUFBRTtZQUM5QyxNQUFNLElBQUksS0FBSyxDQUFDLHNDQUFzQyxDQUFDLENBQUM7U0FDeEQ7UUFDRCxJQUFJLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFFN0IsdUNBQXVDO1FBQ3ZDLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxHQUFHLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQyxLQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFDLENBQUM7UUFFL0csS0FBSyxNQUFNLEdBQUcsSUFBSSxJQUFJLEVBQUU7WUFDdkIsS0FBSyxNQUFNLE1BQU0sSUFBSSxJQUFJLEVBQUU7Z0JBQzFCLElBQUksTUFBTSxLQUFLLE1BQU0sRUFBRTtvQkFDdEIsU0FBUztpQkFDVDtnQkFFRCxJQUFJLEdBQUcsSUFBSSxNQUFNLElBQUksQ0FBQyxDQUFDLEdBQUcsSUFBSSxNQUFNLENBQUMsRUFBRTtvQkFDdEMsWUFBWTtvQkFDWixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUMxQjtxQkFBTSxJQUFJLEdBQUcsSUFBSSxNQUFNLElBQUksR0FBRyxJQUFJLE1BQU0sRUFBRTtvQkFDMUMsWUFBWTtvQkFDWixJQUFJLE9BQU8sTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLFFBQVEsSUFBSSxPQUFPLE1BQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxRQUFRLEVBQUU7d0JBQ3ZFLFlBQVk7d0JBQ1osSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7cUJBQzFDO3lCQUFNO3dCQUNOLFlBQVk7d0JBQ1osTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztxQkFDMUI7aUJBQ0Q7YUFDRDtTQUNEO1FBRUQsT0FBTyxNQUFNLENBQUM7SUFDZixDQUFDO0NBQ0Q7QUFFWSxRQUFBLFdBQVcsR0FBZ0IsSUFBSSxXQUFXLEVBQUUsQ0FBQyJ9