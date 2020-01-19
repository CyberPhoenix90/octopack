import { FileSystem, FileSystemEntryStatus } from '../file_system';

export class ReadonlyFileSystem extends FileSystem {
	private fileSystem: FileSystem;

	constructor(sourceFileSystem: FileSystem) {
		super();
		this.fileSystem = sourceFileSystem;
	}

	public watch(paths: string[], options: any, callback: any): Promise<() => void> {
		return this.fileSystem.watch(paths, options, callback);
	}

	public watchSync(paths: string[], options: any, callback: any): () => void {
		return this.fileSystem.watchSync(paths, options, callback);
	}

	public readlink(path: string): Promise<string> {
		return this.fileSystem.readlink(path);
	}
	public readlinkSync(path: string): string {
		return this.fileSystem.readlinkSync(path);
	}
	public realpath(path: string): Promise<string> {
		return this.fileSystem.realpath(path);
	}
	public realpathSync(path: string): string {
		return this.fileSystem.realpathSync(path);
	}

	public async mkdir(path: string): Promise<void> {
		throw new Error('This file system is read only');
	}

	public mkdirSync(path: string): void {
		throw new Error('This file system is read only');
	}

	public async rmdir(path: string): Promise<void> {
		throw new Error('This file system is read only');
	}

	public rmdirSync(path: string): void {
		throw new Error('This file system is read only');
	}

	public async unlink(path: string): Promise<void> {
		throw new Error('This file system is read only');
	}

	public unlinkSync(path: string): void {
		throw new Error('This file system is read only');
	}

	public async readFile(path: string, encoding: string): Promise<string> {
		return this.fileSystem.readFile(path, encoding);
	}

	public readFileSync(path: string, encoding: string): string {
		return this.fileSystem.readFileSync(path, encoding);
	}

	public async stat(path: string): Promise<FileSystemEntryStatus> {
		return this.fileSystem.stat(path);
	}

	public statSync(path: string): FileSystemEntryStatus {
		return this.fileSystem.statSync(path);
	}

	public async readDir(path: string): Promise<string[]> {
		return this.fileSystem.readDir(path);
	}

	public readDirSync(path: string): string[] {
		return this.fileSystem.readDirSync(path);
	}

	public async exists(path: string): Promise<boolean> {
		return this.fileSystem.exists(path);
	}

	public existsSync(path: string): boolean {
		return this.fileSystem.existsSync(path);
	}

	public async writeFile(path: string, content: string): Promise<void> {
		throw new Error('This file system is read only');
	}

	public writeFileSync(path: string, content: string): void {
		throw new Error('This file system is read only');
	}
}
