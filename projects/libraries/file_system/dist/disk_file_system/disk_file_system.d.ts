import { FileSystem } from '../file_system';
export declare class DiskFileSystem extends FileSystem {
    exists(path: string): Promise<boolean>;
    existsSync(path: string): boolean;
    readFile(path: string, encoding?: string): Promise<string>;
    readFileSync(path: string, encoding?: string): string;
}
export declare const localDiskFileSystem: DiskFileSystem;
