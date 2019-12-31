import { FileSystem, FileSystemEntryData } from '../file_system';
export declare class DiskFileSystem extends FileSystem {
    readDir(path: string): Promise<string[]>;
    readDirSync(path: string): string[];
    stat(path: string): Promise<FileSystemEntryData>;
    statSync(path: string): FileSystemEntryData;
    exists(path: string): Promise<boolean>;
    existsSync(path: string): boolean;
    readFile(path: string, encoding?: string): Promise<string>;
    readFileSync(path: string, encoding?: string): string;
}
export declare const localDiskFileSystem: DiskFileSystem;
//# sourceMappingURL=disk_file_system.d.ts.map