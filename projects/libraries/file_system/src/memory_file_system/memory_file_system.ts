import { FileSystem, FileSystemEntryData } from '../file_system';
import { FilePath } from '../file_path_utils';
import { MapLike } from '../../../../../typings/common';

export type MemoryFileSystemData = { [path: string]: MemoryFileSystemEntry };

export interface MemoryFileSystemEntry {
	type: MemoryFileSystemEntryType;
	name: string;
	fullPath: string;
	children?: { [key: string]: MemoryFileSystemEntry };
	content?: string;
	parent: MemoryFileSystemEntry;
}

export enum MemoryFileSystemEntryType {
	FILE,
	DIRECTORY
}

export class MemoryFileSystem extends FileSystem {
	private fileSystem: MemoryFileSystemEntry;

	constructor(data?: MapLike<string>) {
		super();
		this.fileSystem = data
			? this.fromJson(data)
			: {
					children: {},
					fullPath: '/',
					name: '/',
					parent: undefined,
					type: MemoryFileSystemEntryType.DIRECTORY
			  };
	}

	private fromJson(json: MapLike<string>): MemoryFileSystemEntry {
		throw new Error('not implemented');
	}

	public async toJson(): Promise<MapLike<string>> {
		const files = await this.readDirRecursive('/', {});
		const result: MapLike<string> = {};

		for (const file of files) {
			result[file] = this.readFileSync(file, 'utf8');
		}

		return result;
	}

	public async mkdir(path: string): Promise<void> {
		return this.mkdirSync(path);
	}

	public mkdirSync(path: string): void {
		const fp = new FilePath(path);
		const entry = this.getEntry(fp.getDirectory());
		if (!entry) {
			throw new Error(`Path does not exist for ${path}`);
		} else if (entry.type === MemoryFileSystemEntryType.FILE) {
			throw new Error('cannot add directories into files');
		}

		entry.children[fp.getFullFileName()] = {
			fullPath: path,
			children: {},
			name: fp.getFullFileName(),
			parent: entry,
			type: MemoryFileSystemEntryType.DIRECTORY
		};
	}

	public async rmdir(path: string): Promise<void> {
		return this.rmdirSync(path);
	}

	public rmdirSync(path: string): void {
		const entry = this.getEntry(path);
		if (entry) {
			if (entry.type === MemoryFileSystemEntryType.DIRECTORY) {
				if (Object.keys(entry.children).length !== 0) {
					throw new Error('unlink can only delete empty directories');
				}
				delete entry.parent.children[entry.name];
			} else {
				throw new Error(`rmdir can only remove directories`);
			}
		} else {
			throw new Error(`Path not found: ${path}`);
		}
	}

	public async unlink(path: string): Promise<void> {
		return this.unlinkSync(path);
	}

	public unlinkSync(path: string): void {
		const entry = this.getEntry(path);
		if (entry) {
			if (entry.type === MemoryFileSystemEntryType.DIRECTORY) {
				if (Object.keys(entry.children).length !== 0) {
					throw new Error('unlink can only delete empty directories');
				}
			}
			delete entry.parent.children[entry.name];
		} else {
			throw new Error(`Path not found: ${path}`);
		}
	}

	public async readFile(path: string, encoding: string): Promise<string> {
		return this.readFileSync(path, encoding);
	}

	public readFileSync(path: string, encoding: string): string {
		const entry = this.getEntry(path);
		if (!entry) {
			throw new Error(`No such path ${path}`);
		}
		if (entry.type === MemoryFileSystemEntryType.DIRECTORY) {
			throw new Error(`${path} is a directory`);
		}

		return entry.content;
	}

	public async stat(path: string): Promise<FileSystemEntryData> {
		return this.statSync(path);
	}

	public statSync(path: string): FileSystemEntryData {
		const entry = this.getEntry(path);
		if (!entry) {
			throw new Error(`No such path ${path}`);
		}

		const s: FileSystemEntryData = {
			isDirectory: entry.type === MemoryFileSystemEntryType.DIRECTORY,
			isFile: entry.type === MemoryFileSystemEntryType.FILE,
			isBlockDevice: false,
			isCharacterDevice: false,
			isFIFO: false,
			isSocket: false,
			isSymbolicLink: false,
			size: entry.content ? entry.content.length : 0
		};

		return s;
	}

	public async readDir(path: string): Promise<string[]> {
		return this.readDirSync(path);
	}

	public readDirSync(path: string): string[] {
		const entry = this.getEntry(path);
		if (!entry) {
			throw new Error(`No such path ${path}`);
		}
		if (entry.type === MemoryFileSystemEntryType.FILE) {
			throw new Error(`${path} is a file`);
		}

		return Object.keys(entry.children);
	}

	public async exists(path: string): Promise<boolean> {
		return this.existsSync(path);
	}

	public existsSync(path: string): boolean {
		return this.getEntry(path) !== undefined;
	}

	public async writeFile(path: string, content: string): Promise<void> {
		return this.writeFileSync(path, content);
	}

	public writeFileSync(path: string, content: string): void {
		const fp = new FilePath(path);
		const entry = this.getEntry(fp.getDirectory());
		if (!entry) {
			throw new Error(`Path does not exist for ${path}`);
		} else if (entry.type === MemoryFileSystemEntryType.FILE) {
			throw new Error('cannot add subfiles into files');
		}

		entry.children[fp.getFileName()] = {
			fullPath: path,
			content,
			name: fp.getFileName(),
			parent: entry,
			type: MemoryFileSystemEntryType.FILE
		};
	}

	private getEntry(path: string): MemoryFileSystemEntry {
		let ptr = this.fileSystem;
		if (path.startsWith('/')) {
			path = path.substring(1);
		}

		const pieces = path.split('/').filter((p) => p);
		for (const piece of pieces) {
			if (typeof ptr === 'string') {
				return undefined;
			}

			ptr = ptr.children[piece];
			if (!ptr) {
				return undefined;
			}
		}

		return ptr;
	}
}
