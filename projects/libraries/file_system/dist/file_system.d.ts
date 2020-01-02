export interface ReadDirOptions {
    directoryNameBlackList?: string[];
    includeDirectories?: boolean;
    excludeFiles?: boolean;
    extensionBlackList?: string[];
    extensionWhiteList?: string[];
}
export interface FileSystemEntryData {
    isDirectory: boolean;
    isFile: boolean;
    isBlockDevice: boolean;
    isCharacterDevice: boolean;
    isFIFO: boolean;
    isSocket: boolean;
    isSymbolicLink: boolean;
    size: number;
}
export declare enum FileSystemEntryType {
    FILE = "FILE",
    DIRECTORY = "DIRECTORY"
}
export interface VirtualFileSystemEntry<T extends FileSystemEntryType = FileSystemEntryType> {
    name: string;
    fullPath: string;
    type: T;
    parent: VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY>;
    content?: T extends FileSystemEntryType.FILE ? string : T extends FileSystemEntryType.DIRECTORY ? {
        folders: VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY>;
        files: VirtualFileSystemEntry<FileSystemEntryType.FILE>;
    } : never;
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
    abstract writeFile(path: string, content: string): Promise<void>;
    abstract writeFileSync(path: string, content: string): void;
    abstract mkdir(path: string): Promise<void>;
    abstract mkdirSync(path: string): void;
    abstract rmdir(path: string): Promise<void>;
    abstract rmdirSync(path: string): void;
    abstract unlink(path: string): Promise<void>;
    abstract unlinkSync(path: string): void;
    glob(directory: string, globPattern: string): Promise<string[]>;
    globSync(directory: string, globPattern: string): string[];
    private optimizeGlob;
    toVirtualFile(filePath: string): Promise<VirtualFileSystemEntry<FileSystemEntryType.FILE>>;
    toVirtualFileSync(filePath: string): VirtualFileSystemEntry<FileSystemEntryType.FILE>;
    writeVirtualFile(virtualFile: VirtualFileSystemEntry<FileSystemEntryType.FILE>): Promise<void>;
    writeVirtualFileSync(virtualFile: VirtualFileSystemEntry<FileSystemEntryType.FILE>): void;
    mkdirp(path: string): Promise<void>;
    mkdirpSync(path: string): void;
    deleteDirectory(path: string): Promise<void>;
    deleteDirectorySync(path: string): void;
    emptyDirectory(path: string): Promise<void>;
    emptyDirectorySync(path: string): void;
    merge(fileSystem: FileSystem, options: ReadDirOptions, targetPath?: string, sourcePath?: string): Promise<void>;
    readDirRecursive(path: string, options: ReadDirOptions): Promise<string[]>;
    readDirRecursiveSync(path: string, options: ReadDirOptions): string[];
    private _readDirRecursive;
    private _readDirRecursiveSync;
    private addFileIfMatch;
    import(path: string): Promise<any>;
    importSync(path: string): any;
    getSubfolders(path: string): Promise<string[]>;
    getSubfoldersSync(path: string): string[];
}
//# sourceMappingURL=file_system.d.ts.map