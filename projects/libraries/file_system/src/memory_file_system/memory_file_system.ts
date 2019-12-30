import { FileSystem } from '../file_system';

export class MemoryFileSystem extends FileSystem {
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
