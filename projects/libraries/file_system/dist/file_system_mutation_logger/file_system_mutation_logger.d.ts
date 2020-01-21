import { FileSystem, FileSystemEntryStatus } from '../file_system';
export declare enum FileSystemMutationOperation {
    MK_DIR = 0,
    RM_DIR = 1,
    UNLINK = 2,
    WRITE = 3
}
export interface FileSystemMutation {
    operation: FileSystemMutationOperation;
    path: string;
    newContent?: string;
    contentChanged?: boolean;
    previousContent?: string;
}
export interface FileSystemMutationLoggerOptions {
    logContentBeforeMutation?: boolean;
}
export declare class FileSystemMutationLogger extends FileSystem {
    private fileSystem;
    private options;
    readonly fileSystemMutations: FileSystemMutation[];
    readonly writtenFiles: Set<string>;
    constructor(sourceFileSystem: FileSystem, options?: FileSystemMutationLoggerOptions);
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
//# sourceMappingURL=file_system_mutation_logger.d.ts.map