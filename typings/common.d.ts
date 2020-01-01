export type Callback<T> = (data?: T) => void;
export type Delegate = () => void;
export type Predicate<T> = (data: T) => boolean;
export type Provider<T> = () => T;
export type Comparator<T1, T2> = (value1: T1, value2: T2) => boolean;
export type Constructor<T> = new (...args: any[]) => T;
export type MapLike<T> = { [key: string]: T };
export type Primitive = number | string | boolean | bigint | null | undefined;
export type ValueOrProvider<T> = T | Provider<T>;
export type ValueOrArray<T> = T | T[];
