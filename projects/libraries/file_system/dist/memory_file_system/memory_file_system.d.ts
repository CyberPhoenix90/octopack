/// <reference types="node" />
import { FileSystem, FileSystemEntryStatus, FileSystemEntryType } from '../file_system';
import { MapLike } from '../../../../../typings/common';
export declare type MemoryFileSystemData = {
    [path: string]: MemoryFileSystemEntry;
};
export interface MemoryFileSystemEntry {
    name: string;
    fullPath: string;
    type: FileSystemEntryType;
    parent: MemoryFileSystemEntry;
    children?: {
        [key: string]: MemoryFileSystemEntry;
    };
    content?: string;
}
export declare class MemoryFileSystem extends FileSystem {
    private fileSystem;
    constructor(data?: MapLike<string>);
    watch(paths: string[], options: any, callback: any): Promise<() => void>;
    watchSync(paths: string[], options: any, callback: any): () => void;
    readlink(path: string): Promise<string>;
    readlinkSync(path: string): string;
    realpath(path: string): Promise<string>;
    realpathSync(path: string): string;
    private fromJson;
    toJson(): Promise<MapLike<string>>;
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
    private getEntry;
}
//# sourceMappingURL=memory_file_system.d.ts.map