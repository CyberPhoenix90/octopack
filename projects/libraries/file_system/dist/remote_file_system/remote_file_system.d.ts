import { FileSystem, FileSystemEntryStatus } from '../file_system';
export declare enum RemoteFileSystemOperation {
    MK_DIR = 0,
    RM_DIR = 1,
    UNLINK = 2,
    WRITEFILE = 3,
    WATCH = 4,
    READLINK = 5,
    REALPATH = 6,
    READFILE = 7,
    STAT = 8,
    READDIR = 9,
    EXISTS = 10
}
export declare class RemoteFileSystem extends FileSystem {
    private sendOperation;
    constructor(sendOperation: (request: RemoteFileSystemOperation, args: Array<string | string[]>) => Promise<any>);
    watch(paths: string[], options: any, callback: any): Promise<() => void>;
    watchSync(paths: string[], options: any, callback: any): () => void;
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
    stat(path: string): Promise<FileSystemEntryStatus>;
    statSync(path: string): FileSystemEntryStatus;
    readDir(path: string): Promise<string[]>;
    readDirSync(path: string): string[];
    exists(path: string): Promise<boolean>;
    existsSync(path: string): boolean;
    writeFile(path: string, content: string): Promise<void>;
    writeFileSync(path: string, content: string): void;
}
//# sourceMappingURL=remote_file_system.d.ts.map