import { FileSystem, FileSystemEntryStatus, FileSystemEntryType } from '../file_system';
import { parse, join } from 'path';

export class CachedFileSystem extends FileSystem {
	private fileSystem: FileSystem;
	private cacheFileSystem: FileSystem;

	constructor(sourceFileSystem: FileSystem, cacheFileSystem: FileSystem) {
		super();
		this.fileSystem = sourceFileSystem;
		this.cacheFileSystem = cacheFileSystem;
	}

	public watch(paths: string[], options: any, callback: any): Promise<() => void> {
		throw new Error('Method not implemented.');
	}
	public watchSync(paths: string[], options: any, callback: any): () => void {
		throw new Error('Method not implemented.');
	}

	public async readlink(path: string): Promise<string> {
		return (await this.cacheFileSystem.readlink(path)) || (await this.fileSystem.readlink(path));
	}
	public readlinkSync(path: string): string {
		return this.cacheFileSystem.readlinkSync(path) || this.fileSystem.readlinkSync(path);
	}
	public async realpath(path: string): Promise<string> {
		return (await this.cacheFileSystem.realpath(path)) || (await this.fileSystem.realpath(path));
	}
	public realpathSync(path: string): string {
		return this.cacheFileSystem.realpathSync(path) || this.fileSystem.realpathSync(path);
	}

	public async cache(path: string): Promise<void> {
		if (await this.fileSystem.exists(path)) {
			const stat = await this.fileSystem.stat(path);
			if (stat.type === FileSystemEntryType.DIRECTORY) {
				await this.cacheFileSystem.mkdirp(path);
				const files = await this.fileSystem.readDir(path);
				for (const file of files) {
					await this.cache(join(path, file));
				}
			} else {
				await this.cacheFileSystem.mkdirp(parse(path).dir);
				return this.copyFileFileSystem(path, this.cacheFileSystem, path);
			}
		}
	}

	public cacheSync(path: string): void {
		if (this.fileSystem.existsSync(path)) {
			const stat = this.fileSystem.statSync(path);
			if (stat.type === FileSystemEntryType.DIRECTORY) {
				this.cacheFileSystem.mkdirpSync(path);
				const files = this.fileSystem.readDirSync(path);
				for (const file of files) {
					this.cacheSync(join(path, file));
				}
			} else {
				this.cacheFileSystem.mkdirp(parse(path).dir);
				return this.copyFileFileSystemSync(path, this.cacheFileSystem, path);
			}
		}
	}

	public async flushCache(): Promise<void> {
		const files = await this.cacheFileSystem.readDirRecursive('/', {});
		for (const file of files) {
			await this.fileSystem.mkdirp(parse(file).dir);
			await this.cacheFileSystem.moveFileFileSystem(file, this.fileSystem, file);
		}
	}

	public flushCacheSync(): void {
		const files = this.cacheFileSystem.readDirRecursiveSync('/', {});
		for (const file of files) {
			this.fileSystem.mkdirpSync(parse(file).dir);
			this.cacheFileSystem.moveFileFileSystemSync(file, this.fileSystem, file);
		}
	}

	public async mkdir(path: string): Promise<void> {
		if (!this.fileSystem.exists(path)) {
			return this.cacheFileSystem.mkdir(path);
		} else {
			await this.cacheFileSystem.mkdirp(path);
		}
	}

	public mkdirSync(path: string): void {
		if (!this.fileSystem.exists(path)) {
			return this.cacheFileSystem.mkdirSync(path);
		} else {
			this.cacheFileSystem.mkdirpSync(path);
		}
	}

	public async rmdir(path: string): Promise<void> {
		if (await this.cacheFileSystem.exists(path)) {
			this.cacheFileSystem.rmdir(path);
		}
		if (await this.fileSystem.exists(path)) {
			this.fileSystem.rmdir(path);
		}
	}

	public rmdirSync(path: string): void {
		if (this.cacheFileSystem.existsSync(path)) {
			this.cacheFileSystem.rmdirSync(path);
		}
		if (this.fileSystem.existsSync(path)) {
			this.fileSystem.rmdirSync(path);
		}
	}

	public async unlink(path: string): Promise<void> {
		if (await this.cacheFileSystem.exists(path)) {
			this.cacheFileSystem.unlink(path);
		}
		if (await this.fileSystem.exists(path)) {
			this.fileSystem.unlink(path);
		}
	}

	public unlinkSync(path: string): void {
		if (this.cacheFileSystem.existsSync(path)) {
			this.cacheFileSystem.unlinkSync(path);
		}
		if (this.fileSystem.existsSync(path)) {
			this.fileSystem.unlinkSync(path);
		}
	}

	public async readFile(path: string, encoding: string): Promise<string> {
		if (await this.cacheFileSystem.exists(path)) {
			return this.cacheFileSystem.readFile(path, encoding);
		} else {
			return this.fileSystem.readFile(path, encoding);
		}
	}

	public readFileSync(path: string, encoding: string): string;
	public readFileSync(path: string): Buffer;
	public readFileSync(path: string, encoding?: string): string | Buffer {
		if (this.cacheFileSystem.existsSync(path)) {
			return this.cacheFileSystem.readFileSync(path, encoding);
		} else {
			return this.fileSystem.readFileSync(path, encoding);
		}
	}

	public async stat(path: string): Promise<FileSystemEntryStatus> {
		if (await this.cacheFileSystem.exists(path)) {
			return this.cacheFileSystem.stat(path);
		} else {
			return this.fileSystem.stat(path);
		}
	}

	public statSync(path: string): FileSystemEntryStatus {
		if (this.cacheFileSystem.existsSync(path)) {
			return this.cacheFileSystem.statSync(path);
		} else {
			return this.fileSystem.statSync(path);
		}
	}

	public async readDir(path: string): Promise<string[]> {
		if (await this.cacheFileSystem.exists(path)) {
			return this.cacheFileSystem.readDir(path);
		} else {
			return this.fileSystem.readDir(path);
		}
	}

	public readDirSync(path: string): string[] {
		if (this.cacheFileSystem.existsSync(path)) {
			return this.cacheFileSystem.readDirSync(path);
		} else {
			return this.fileSystem.readDirSync(path);
		}
	}

	public async exists(path: string): Promise<boolean> {
		if (await this.cacheFileSystem.exists(path)) {
			return true;
		} else {
			return this.fileSystem.exists(path);
		}
	}

	public existsSync(path: string): boolean {
		if (this.cacheFileSystem.existsSync(path)) {
			return true;
		} else {
			return this.fileSystem.existsSync(path);
		}
	}

	public async writeFile(path: string, content: string): Promise<void> {
		const folder = parse(path).dir;
		if (await this.exists(folder)) {
			if (!(await this.cacheFileSystem.exists(folder))) {
				await this.cacheFileSystem.mkdirp(folder);
			}
			return this.cacheFileSystem.writeFile(path, content);
		}
	}

	public writeFileSync(path: string, content: string): void {
		const folder = parse(path).dir;
		if (this.existsSync(folder)) {
			if (!this.cacheFileSystem.existsSync(folder)) {
				this.cacheFileSystem.mkdirpSync(folder);
			}
			this.cacheFileSystem.writeFileSync(path, content);
		}
	}
}
