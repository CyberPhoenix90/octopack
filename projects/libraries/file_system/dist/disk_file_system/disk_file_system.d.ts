import { FileSystem, FileSystemEntryStatus } from '../file_system';
export declare class DiskFileSystem extends FileSystem {
    readDir(path: string): Promise<string[]>;
    readDirSync(path: string): string[];
    writeFile(path: string, content: string): Promise<void>;
    writeFileSync(path: string, content: string): void;
    mkdir(path: string): Promise<void>;
    mkdirSync(path: string): void;
    rmdir(path: string): Promise<void>;
    rmdirSync(path: string): void;
    unlink(path: string): Promise<void>;
    unlinkSync(path: string): Promise<void>;
    stat(path: string): Promise<FileSystemEntryStatus>;
    statSync(path: string): FileSystemEntryStatus;
    private mapStatsToFileSystemEntryStatus;
    exists(path: string): Promise<boolean>;
    existsSync(path: string): boolean;
    readFile(path: string, encoding?: string): Promise<string>;
    readFileSync(path: string, encoding?: string): string;
}
export declare const localDiskFileSystem: DiskFileSystem;
//# sourceMappingURL=disk_file_system.d.ts.map