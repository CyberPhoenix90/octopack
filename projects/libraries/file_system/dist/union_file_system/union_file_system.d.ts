/// <reference types="node" />
import { FileSystem, WatchOptions, WatchCallback, FileSystemEntryStatus } from '../file_system';
export declare class UnionFileSystem extends FileSystem {
    private readonly fileSystems;
    constructor(fileSystems: FileSystem[]);
    watch(paths: string[], options: WatchOptions, callback: WatchCallback): Promise<() => void>;
    watchSync(paths: string[], options: WatchOptions, callback: WatchCallback): () => void;
    readlink(path: string): Promise<string>;
    readlinkSync(path: string): string;
    realpath(path: string): Promise<string>;
    realpathSync(path: string): string;
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
//# sourceMappingURL=union_file_system.d.ts.map