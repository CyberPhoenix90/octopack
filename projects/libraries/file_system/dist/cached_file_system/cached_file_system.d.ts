/// <reference types="node" />
import { FileSystem, FileSystemEntryStatus } from '../file_system';
export declare class CachedFileSystem extends FileSystem {
    private fileSystem;
    private cacheFileSystem;
    constructor(sourceFileSystem: FileSystem, cacheFileSystem: FileSystem);
    watch(paths: string[], options: any, callback: any): Promise<() => void>;
    watchSync(paths: string[], options: any, callback: any): () => void;
    readlink(path: string): Promise<string>;
    readlinkSync(path: string): string;
    realpath(path: string): Promise<string>;
    realpathSync(path: string): string;
    cache(path: string): Promise<void>;
    cacheSync(path: string): void;
    flushCache(): Promise<void>;
    flushCacheSync(): void;
    mkdir(path: string): Promise<void>;
    mkdirSync(path: string): void;
    rmdir(path: string): Promise<void>;
    rmdirSync(path: string): void;
    unlink(path: string): Promise<void>;
    unlinkSync(path: string): void;
    readFile(path: string, encoding: string): Promise<string>;
    readFileSync(path: string, encoding: string): string;
    readFileSync(path: string): Buffer;
    stat(path: string): Promise<FileSystemEntryStatus>;
    statSync(path: string): FileSystemEntryStatus;
    readDir(path: string): Promise<string[]>;
    readDirSync(path: string): string[];
    exists(path: string): Promise<boolean>;
    existsSync(path: string): boolean;
    writeFile(path: string, content: string): Promise<void>;
    writeFileSync(path: string, content: string): void;
}
//# sourceMappingURL=cached_file_system.d.ts.map