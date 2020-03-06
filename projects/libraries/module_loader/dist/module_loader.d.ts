interface Config {
    baseUrl: string;
    paths: {
        [key: string]: string;
    };
}
interface DefinedModule {
    definePromise: Promise<void>;
    definePromiseResolve: () => void;
    name: string;
    url: string;
    exports: any;
}
declare var define: {
    (name: string, dependenies: string[], callback?: () => void): void;
    amd: {
        jQuery: boolean;
    };
}, require: {
    (files: string | string[], callback?: (...args: any[]) => void): any;
    config(c: Config): void;
};
//# sourceMappingURL=module_loader.d.ts.map