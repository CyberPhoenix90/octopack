import { FileSystem } from '../file_system';

export class MemoryFileSystem extends FileSystem {
	public readDir(path: string): Promise<string[]> {
		throw new Error('Method not implemented.');
	}
	public readDirSync(path: string): string[] {
		throw new Error('Method not implemented.');
	}
	public stat(path: string): Promise<import('../file_system').FileSystemEntryData> {
		throw new Error('Method not implemented.');
	}
	public statSync(path: string): import('../file_system').FileSystemEntryData {
		throw new Error('Method not implemented.');
	}
	public readFile(path: string, encoding: string): Promise<string> {
		throw new Error('Method not implemented.');
	}
	public readFileSync(path: string, encoding: string): string {
		throw new Error('Method not implemented.');
	}
	public exists(path: string): Promise<boolean> {
		throw new Error('Method not implemented.');
	}
	public existsSync(path: string): boolean {
		throw new Error('Method not implemented.');
	}
}
