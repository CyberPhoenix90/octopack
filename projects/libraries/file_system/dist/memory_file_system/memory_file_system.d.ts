import { FileSystem } from '../file_system';
export declare class MemoryFileSystem extends FileSystem {
    readDir(path: string): Promise<string[]>;
    readDirSync(path: string): string[];
    stat(path: string): Promise<import('../file_system').FileSystemEntryData>;
    statSync(path: string): import('../file_system').FileSystemEntryData;
    readFile(path: string, encoding: string): Promise<string>;
    readFileSync(path: string, encoding: string): string;
    exists(path: string): Promise<boolean>;
    existsSync(path: string): boolean;
}
//# sourceMappingURL=memory_file_system.d.ts.map