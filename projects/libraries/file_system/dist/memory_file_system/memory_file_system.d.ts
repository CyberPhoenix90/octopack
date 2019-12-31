import { FileSystem } from '../file_system';
export declare class MemoryFileSystem extends FileSystem {
    readFile(path: string, encoding: string): Promise<string>;
    readFileSync(path: string, encoding: string): string;
    exists(path: string): Promise<boolean>;
    existsSync(path: string): boolean;
}
//# sourceMappingURL=memory_file_system.d.ts.map