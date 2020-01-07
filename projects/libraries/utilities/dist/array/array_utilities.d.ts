declare class ArrayUtils {
    static flatMapAsync<T, M>(array: T[], cb: (item: T, index: number, array: T[]) => Promise<M[]>): Promise<M[]>;
    static mapAsync<T, M>(array: T[], cb: (item: T, index: number, array: T[]) => Promise<M>): Promise<M[]>;
    static filterAsync<T>(array: T[], cb: (item: T, index: number, array: T[]) => Promise<boolean>): Promise<T[]>;
    static forEachAsync<T>(array: T[], cb: (item: T, index: number, array: T[]) => Promise<T>): Promise<void>;
}
export declare const arrayUtils: ArrayUtils;
export {};
//# sourceMappingURL=array_utilities.d.ts.map