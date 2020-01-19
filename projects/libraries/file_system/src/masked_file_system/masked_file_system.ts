import { FileSystem, FileSystemEntryStatus } from '../file_system';

export class MaskedFileSystem extends FileSystem {
	public watch(paths: string[], options: any, callback: any): Promise<() => void> {
		throw new Error('Method not implemented.');
	}
	public watchSync(paths: string[], options: any, callback: any): () => void {
		throw new Error('Method not implemented.');
	}
	private fileSystem: FileSystem;
	private allowedFiles: Set<string>;

	constructor(allowedFiles: Set<string>, sourceFileSystem: FileSystem) {
		super();
		this.fileSystem = sourceFileSystem;
		this.allowedFiles = allowedFiles;
	}

	public async mkdir(path: string): Promise<void> {
		this.allowedFiles.add(path);
		return this.fileSystem.mkdir(path);
	}

	public mkdirSync(path: string): void {
		this.allowedFiles.add(path);
		return this.fileSystem.mkdirSync(path);
	}

	public async rmdir(path: string): Promise<void> {
		this.allowedFiles.delete(path);
		return this.fileSystem.rmdir(path);
	}

	public rmdirSync(path: string): void {
		this.allowedFiles.delete(path);
		return this.fileSystem.rmdirSync(path);
	}

	public async unlink(path: string): Promise<void> {
		this.allowedFiles.delete(path);
		return this.fileSystem.unlink(path);
	}

	public unlinkSync(path: string): void {
		this.allowedFiles.delete(path);
		return this.fileSystem.unlinkSync(path);
	}

	public async readFile(path: string, encoding: string): Promise<string> {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.readFile(path, encoding);
		} else {
			throw new Error('Access denied');
		}
	}

	public readlink(path: string): Promise<string> {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.readlink(path);
		} else {
			throw new Error('Access denied');
		}
	}
	public readlinkSync(path: string): string {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.readlinkSync(path);
		} else {
			throw new Error('Access denied');
		}
	}

	public realpath(path: string): Promise<string> {
		return this.fileSystem.realpath(path);
	}
	public realpathSync(path: string): string {
		return this.fileSystem.realpathSync(path);
	}

	public readFileSync(path: string, encoding: string): string {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.readFileSync(path, encoding);
		} else {
			throw new Error('Access denied');
		}
	}

	public async stat(path: string): Promise<FileSystemEntryStatus> {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.stat(path);
		} else {
			throw new Error('Access denied');
		}
	}

	public statSync(path: string): FileSystemEntryStatus {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.statSync(path);
		} else {
			throw new Error('Access denied');
		}
	}

	public async readDir(path: string): Promise<string[]> {
		if (this.allowedFiles.has(path)) {
			return (await this.fileSystem.readDir(path)).filter((p) => this.allowedFiles.has(p));
		} else {
			throw new Error('Access denied');
		}
	}

	public readDirSync(path: string): string[] {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.readDirSync(path).filter((p) => this.allowedFiles.has(p));
		} else {
			throw new Error('Access denied');
		}
	}

	public async exists(path: string): Promise<boolean> {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.exists(path);
		} else {
			return false;
		}
	}

	public existsSync(path: string): boolean {
		if (this.allowedFiles.has(path)) {
			return this.fileSystem.existsSync(path);
		} else {
			return false;
		}
	}

	public async writeFile(path: string, content: string): Promise<void> {
		this.allowedFiles.add(path);
		return this.fileSystem.writeFile(path, content);
	}

	public writeFileSync(path: string, content: string): void {
		this.allowedFiles.add(path);
		return this.fileSystem.writeFileSync(path, content);
	}
}
