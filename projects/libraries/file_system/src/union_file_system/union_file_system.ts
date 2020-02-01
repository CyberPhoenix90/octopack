import { FileSystem, WatchOptions, WatchCallback, FileSystemEntryStatus } from '../file_system';

export class UnionFileSystem extends FileSystem {
	private readonly fileSystems: FileSystem[];

	constructor(fileSystems: FileSystem[]) {
		super();
		this.fileSystems = fileSystems;
	}

	public async watch(paths: string[], options: WatchOptions, callback: WatchCallback): Promise<() => void> {
		throw new Error('Not implemented');
	}

	public watchSync(paths: string[], options: WatchOptions, callback: WatchCallback): () => void {
		throw new Error('Not implemented');
	}

	public async readlink(path: string): Promise<string> {
		for (const fs of this.fileSystems) {
			try {
				return await fs.readlink(path);
			} catch (e) {}
		}

		throw {
			errno: -22,
			code: 'EINVAL',
			syscall: 'readlink',
			path
		};
	}

	public readlinkSync(path: string): string {
		for (const fs of this.fileSystems) {
			try {
				return fs.readlinkSync(path);
			} catch (e) {}
		}

		throw {
			errno: -22,
			code: 'EINVAL',
			syscall: 'readlink',
			path
		};
	}

	public async realpath(path: string): Promise<string> {
		for (const fs of this.fileSystems) {
			try {
				return await fs.realpath(path);
			} catch (e) {}
		}

		throw new Error(`No such path ${path}`);
	}

	public realpathSync(path: string): string {
		for (const fs of this.fileSystems) {
			try {
				return fs.realpathSync(path);
			} catch (e) {}
		}

		throw new Error(`No such path ${path}`);
	}

	public async mkdir(path: string): Promise<void> {
		for (const fs of this.fileSystems) {
			try {
				await fs.mkdir(path);
			} catch (e) {}
		}
	}

	public mkdirSync(path: string): void {
		for (const fs of this.fileSystems) {
			try {
				fs.mkdirSync(path);
			} catch (e) {}
		}
	}

	public async rmdir(path: string): Promise<void> {
		for (const fs of this.fileSystems) {
			try {
				await fs.rmdir(path);
			} catch (e) {}
		}
	}

	public rmdirSync(path: string): void {
		for (const fs of this.fileSystems) {
			try {
				fs.rmdirSync(path);
			} catch (e) {}
		}
	}

	public async unlink(path: string): Promise<void> {
		for (const fs of this.fileSystems) {
			await fs.unlink(path);
		}
	}

	public unlinkSync(path: string): void {
		for (const fs of this.fileSystems) {
			fs.unlinkSync(path);
		}
	}

	public async readFile(path: string, encoding: string): Promise<string> {
		for (const fs of this.fileSystems) {
			try {
				return await fs.readFile(path, encoding);
			} catch (e) {}
		}

		throw new Error(`No such path ${path}`);
	}

	public readFileSync(path: string, encoding: string): string;
	public readFileSync(path: string): Buffer;
	public readFileSync(path: string, encoding?: string): string | Buffer {
		for (const fs of this.fileSystems) {
			try {
				return fs.readFileSync(path, encoding);
			} catch (e) {}
		}

		throw new Error(`No such path ${path}`);
	}

	public async stat(path: string): Promise<FileSystemEntryStatus> {
		for (const fs of this.fileSystems) {
			try {
				return await fs.stat(path);
			} catch (e) {}
		}

		throw new Error(`No such path ${path}`);
	}

	public statSync(path: string): FileSystemEntryStatus {
		for (const fs of this.fileSystems) {
			try {
				return fs.statSync(path);
			} catch (e) {}
		}

		throw new Error(`No such path ${path}`);
	}

	public async readDir(path: string): Promise<string[]> {
		for (const fs of this.fileSystems) {
			try {
				return await fs.readDir(path);
			} catch (e) {}
		}

		throw new Error(`No such path ${path}`);
	}

	public readDirSync(path: string): string[] {
		for (const fs of this.fileSystems) {
			try {
				return fs.readDirSync(path);
			} catch (e) {}
		}

		throw new Error(`No such path ${path}`);
	}

	public async exists(path: string): Promise<boolean> {
		for (const fs of this.fileSystems) {
			if (await fs.exists(path)) {
				return true;
			}
		}

		return false;
	}

	public existsSync(path: string): boolean {
		for (const fs of this.fileSystems) {
			if (fs.existsSync(path)) {
				return true;
			}
		}

		return false;
	}

	public async writeFile(path: string, content: string): Promise<void> {
		for (const fs of this.fileSystems) {
			try {
				await fs.writeFile(path, content);
			} catch (e) {}
		}
	}

	public writeFileSync(path: string, content: string): void {
		for (const fs of this.fileSystems) {
			try {
				fs.writeFileSync(path, content);
			} catch (e) {}
		}
	}
}
