export interface FileSystemEntryData {
    isDirectory: boolean;
    isFile: boolean;
}
export declare abstract class FileSystem {
    abstract exists(path: string): Promise<boolean>;
    abstract existsSync(path: string): boolean;
    abstract readFile(path: string, encoding: string): Promise<string>;
    abstract readFileSync(path: string, encoding: string): string;
    abstract readDir(path: string): Promise<string[]>;
    abstract readDirSync(path: string): string[];
    abstract stat(path: string): Promise<FileSystemEntryData>;
    abstract statSync(path: string): FileSystemEntryData;
    import(path: string): Promise<any>;
    importSync(path: string): any;
    getSubfolders(path: string): Promise<string[]>;
    getSubfoldersSync(path: string): string[];
}
//# sourceMappingURL=file_system.d.ts.map