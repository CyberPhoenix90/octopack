import { match } from 'minimatch';
import { join, parse, sep } from 'path';
import * as vm from 'vm';
import { FilePath } from './file_path_utils';
import { MapLike } from '../../../../typings/common';

export interface ReadDirOptions {
	directoryNameBlackList?: string[];
	includeDirectories?: boolean;
	excludeFiles?: boolean;
	extensionBlackList?: string[];
	extensionWhiteList?: string[];
}

export interface FileSystemEntryData {
	isDirectory: boolean;
	isFile: boolean;
	isBlockDevice: boolean;
	isCharacterDevice: boolean;
	isFIFO: boolean;
	isSocket: boolean;
	isSymbolicLink: boolean;
	size: number;
}

export enum FileSystemEntryType {
	FILE = 'FILE',
	DIRECTORY = 'DIRECTORY'
}

export interface VirtualFileSystemEntry<T extends FileSystemEntryType = FileSystemEntryType> {
	name: string;
	fullPath: string;
	type: T;
	parent: VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY>;

	content?: T extends FileSystemEntryType.FILE
		? string
		: T extends FileSystemEntryType.DIRECTORY
		? {
				folders: VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY>[];
				files: VirtualFileSystemEntry<FileSystemEntryType.FILE>[];
		  }
		: never;
}

export abstract class FileSystem {
	public abstract exists(path: string): Promise<boolean>;
	public abstract existsSync(path: string): boolean;
	public abstract readFile(path: string, encoding: string): Promise<string>;
	public abstract readFileSync(path: string, encoding: string): string;
	public abstract readDir(path: string): Promise<string[]>;
	public abstract readDirSync(path: string): string[];
	public abstract stat(path: string): Promise<FileSystemEntryData>;
	public abstract statSync(path: string): FileSystemEntryData;
	public abstract writeFile(path: string, content: string): Promise<void>;
	public abstract writeFileSync(path: string, content: string): void;
	public abstract mkdir(path: string): Promise<void>;
	public abstract mkdirSync(path: string): void;
	public abstract rmdir(path: string): Promise<void>;
	public abstract rmdirSync(path: string): void;
	public abstract unlink(path: string): Promise<void>;
	public abstract unlinkSync(path: string): void;

	public async glob(directory: string, globPattern: string): Promise<string[]> {
		({ directory, globPattern } = this.optimizeGlob(directory, globPattern));
		const candidates = await this.readDirRecursive(directory, {});
		return match(candidates, globPattern);
	}

	public globSync(directory: string, globPattern: string): string[] {
		({ directory, globPattern } = this.optimizeGlob(directory, globPattern));
		const candidates = this.readDirRecursiveSync(directory, {});
		return match(candidates, globPattern);
	}

	private optimizeGlob(directory: string, globPattern: string): { directory: string; globPattern: string } {
		if (globPattern.startsWith('/')) {
			globPattern = globPattern.substring(1);
		}
		const pieces = globPattern.split('/');
		while (
			pieces.length !== 0 &&
			!pieces[0].includes('*') &&
			!pieces[0].includes('!') &&
			!pieces[0].includes('(')
		) {
			directory = join(directory, pieces.shift());
		}

		return { directory, globPattern: pieces.join('/') };
	}

	public async toVirtualFile(filePath: string): Promise<VirtualFileSystemEntry<FileSystemEntryType.FILE>> {
		const content = await this.readFile(filePath, 'utf8');
		return {
			fullPath: filePath,
			name: parse(filePath).name,
			content,
			type: FileSystemEntryType.FILE,
			parent: undefined
		};
	}

	public toVirtualFileSync(filePath: string): VirtualFileSystemEntry<FileSystemEntryType.FILE> {
		const content = this.readFileSync(filePath, 'utf8');
		return {
			fullPath: filePath,
			name: parse(filePath).name,
			content,
			type: FileSystemEntryType.FILE,
			parent: undefined
		};
	}

	public async serializeFolder(path: string): Promise<MapLike<VirtualFileSystemEntry>> {
		if (await this.exists(path)) {
			const result: MapLike<VirtualFileSystemEntry> = {};

			const entry: VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY> = {
				fullPath: path,
				name: parse(path).name,
				parent: undefined,
				type: FileSystemEntryType.DIRECTORY,
				content: {
					files: [],
					folders: []
				}
			};
			result[path] = entry;
			await this.serializeFolderContent(result, entry);

			return result;
		} else {
			throw new Error(`Path ${path} does not exist`);
		}
	}

	private async serializeFolderContent(
		map: MapLike<VirtualFileSystemEntry>,
		entry: VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY>
	): Promise<void> {
		const contents = await this.readDir(entry.fullPath);
		for (const content of contents) {
			const newPath = join(entry.fullPath, content);
			if ((await this.stat(newPath)).isDirectory) {
				const newEntry: VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY> = {
					fullPath: newPath,
					name: content,
					parent: entry,
					type: FileSystemEntryType.DIRECTORY,
					content: {
						files: [],
						folders: []
					}
				};
				entry.content.folders.push(newEntry);
				map[newPath] = newEntry;
				this.serializeFolderContent(map, newEntry);
			} else {
				const newEntry: VirtualFileSystemEntry<FileSystemEntryType.FILE> = {
					fullPath: newPath,
					name: content,
					parent: entry,
					type: FileSystemEntryType.FILE,
					content: await this.readFile(newPath, 'utf8')
				};
				entry.content.files.push(newEntry);
				map[newPath] = newEntry;
			}
		}
	}

	public async writeVirtualFile(virtualFile: VirtualFileSystemEntry<FileSystemEntryType.FILE>): Promise<void> {
		this.writeFile(virtualFile.fullPath, virtualFile.content);
	}

	public writeVirtualFileSync(virtualFile: VirtualFileSystemEntry<FileSystemEntryType.FILE>): void {
		this.writeFileSync(virtualFile.fullPath, virtualFile.content);
	}

	public async mkdirp(path: string): Promise<void> {
		const pieces = path.split(sep);
		let currentPath: string = '';
		for (const p of pieces) {
			currentPath += p;
			if (p && !(await this.exists(currentPath))) {
				await this.mkdir(currentPath);
			}
			currentPath += sep;
		}
	}

	public mkdirpSync(path: string): void {
		const pieces = path.split(sep);
		let currentPath: string = '';
		for (const p of pieces) {
			currentPath += p;
			if (p && !this.existsSync(currentPath)) {
				this.mkdirSync(currentPath);
			}
			currentPath += sep;
		}
	}

	public async deleteDirectory(path: string): Promise<void> {
		await this.emptyDirectory(path);
		await this.rmdir(path);
	}

	public deleteDirectorySync(path: string): void {
		this.emptyDirectorySync(path);
		this.rmdirSync(path);
	}

	public async emptyDirectory(path: string): Promise<void> {
		const files: string[] = await this.readDir(path);

		for (const file of files) {
			const filePath = join(path.toString(), file);
			if ((await this.stat(filePath)).isDirectory) {
				await this.emptyDirectory(filePath);
				await this.rmdir(filePath);
			} else {
				await this.unlink(filePath);
			}
		}
	}

	public emptyDirectorySync(path: string): void {
		const files: string[] = this.readDirSync(path);

		for (const file of files) {
			const filePath = join(path.toString(), file);
			if (this.statSync(filePath).isDirectory) {
				this.emptyDirectorySync(filePath);
				this.rmdirSync(filePath);
			} else {
				this.unlinkSync(filePath);
			}
		}
	}

	public async merge(
		fileSystem: FileSystem,
		options: ReadDirOptions,
		targetPath: string = '/',
		sourcePath: string = '/'
	): Promise<void> {
		if (!(await this.exists(targetPath))) {
			throw new Error('target path does not exist');
		}
		if (!(await fileSystem.exists(sourcePath))) {
			throw new Error('source path does not exist');
		}

		const toMerge = await fileSystem.readDirRecursive(sourcePath, options);
		for (const file of toMerge) {
			if (options.includeDirectories && (await this.stat(file)).isDirectory) {
				await this.mkdirp(file);
			} else {
				await this.mkdirp(new FilePath(file).getDirectory());
				await this.writeFile(join(targetPath, file), await fileSystem.readFile(file, 'utf8'));
			}
		}
	}

	public readDirRecursive(path: string, options: ReadDirOptions): Promise<string[]> {
		return this._readDirRecursive(path, options, []);
	}

	public readDirRecursiveSync(path: string, options: ReadDirOptions): string[] {
		return this._readDirRecursiveSync(path, options, []);
	}

	private async _readDirRecursive(path: string, options: ReadDirOptions, results: string[]): Promise<string[]> {
		if (!(await this.exists(path))) {
			throw new Error(`Path does not exist ${path}`);
		}

		const f = await this.readDir(path);
		for (const file of f) {
			if ((await this.stat(join(path, file))).isFile) {
				this.addFileIfMatch(options, file, results, path);
			} else {
				if (!options.directoryNameBlackList || !options.directoryNameBlackList.includes(file)) {
					if (options.includeDirectories) {
						results.push(join(path, file));
					}
					await this._readDirRecursive(join(path, file), options, results);
				}
			}
		}
		return results;
	}

	private _readDirRecursiveSync(path: string, options: ReadDirOptions, results: string[]): string[] {
		if (!this.existsSync(path)) {
			throw new Error(`Path does not exist ${path}`);
		}

		const f = this.readDirSync(path);
		for (const file of f) {
			if (this.statSync(join(path, file)).isFile) {
				this.addFileIfMatch(options, file, results, path);
			} else {
				if (!options.directoryNameBlackList || !options.directoryNameBlackList.includes(file)) {
					if (options.includeDirectories) {
						results.push(join(path, file));
					}
					this._readDirRecursiveSync(join(path, file), options, results);
				}
			}
		}
		return results;
	}

	private addFileIfMatch(options: ReadDirOptions, file: string, results: string[], path: string) {
		if (!options.excludeFiles) {
			if (options.extensionWhiteList) {
				const fp = new FilePath(file);
				if (options.extensionWhiteList.includes(fp.getExtensionString())) {
					results.push(join(path, file));
				}
			} else if (options.extensionBlackList) {
				const fp = new FilePath(file);
				if (!options.extensionBlackList.includes(fp.getExtensionString())) {
					results.push(join(path, file));
				}
			} else {
				results.push(join(path, file));
			}
		}
	}

	public async import(path: string): Promise<any> {
		return runModule(await this.readFile(path, 'utf8'));
	}

	public importSync(path: string): any {
		return runModule(this.readFileSync(path, 'utf8'));
	}

	public async getSubfolders(path: string): Promise<string[]> {
		const subEntries = (await this.readDir(path)).map((entry) => join(path, entry));
		const result: string[] = [];

		for (const entry of subEntries) {
			if (await (await this.stat(entry)).isDirectory) {
				result.push(entry);
			}
		}

		return result;
	}

	public getSubfoldersSync(path: string): string[] {
		return this.readDirSync(path)
			.map((entry) => join(path, entry))
			.filter((entry) => this.statSync(entry).isDirectory);
	}
}

function runModule(code: string) {
	const sandboxContext: any = { module: { exports: undefined } };
	vm.createContext(sandboxContext);
	vm.runInContext(`((module) => {${code}})(module)`, sandboxContext);
	return sandboxContext.module.exports;
}
