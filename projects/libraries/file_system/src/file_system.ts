import { match } from 'minimatch';
import { join, sep, relative, parse } from 'path';
import * as vm from 'vm';
import { FilePath } from './file_path_utils';
import { MapLike } from '../../../../typings/common';
import { createHash } from 'crypto';

export interface WatchOptions {
	recursive: boolean;
	filter?: (path: string) => boolean;
	persistent?: boolean;
	changeBufferTime?: number;
}

export type WatchEvent = 'create' | 'update' | 'remove';

export type WatchCallback = (event: WatchEvent, path: string) => void;

export interface ReadDirOptions {
	directoryNameBlackList?: string[];
	includeDirectories?: boolean;
	excludeFiles?: boolean;
	/**
	 * match partial extensions means in files that have double extensions like .d.ts a simple .ts search would match
	 */
	matchPartialExtensions?: boolean;
	extensionBlackList?: string[];
	extensionWhiteList?: string[];
}

export interface FileSystemEntryStatus {
	isBlockDevice(): boolean;
	isCharacterDevice(): boolean;
	isFIFO(): boolean;
	isSocket(): boolean;
	isSymbolicLink(): boolean;
	isFile(): boolean;
	isDirectory(): boolean;
	size: number;
	type: FileSystemEntryType;
}

export enum FileSystemEntryType {
	FILE = 'FILE',
	DIRECTORY = 'DIRECTORY'
}

export interface VirtualFileSystemEntry<T extends FileSystemEntryType = FileSystemEntryType> {
	fullPath: string;
	type: T;
	parent: VirtualFolder;

	content?: T extends FileSystemEntryType.FILE
		? string
		: T extends FileSystemEntryType.DIRECTORY
		? {
				folders: VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY>[];
				files: VirtualFileSystemEntry<FileSystemEntryType.FILE>[];
		  }
		: never;
}
export type VirtualFile = VirtualFileSystemEntry<FileSystemEntryType.FILE>;
export type VirtualFolder = VirtualFileSystemEntry<FileSystemEntryType.DIRECTORY>;

export abstract class FileSystem {
	public abstract exists(path: string): Promise<boolean>;
	public abstract existsSync(path: string): boolean;
	public abstract readFile(path: string, encoding: string): Promise<string>;
	public abstract readFileSync(path: string, encoding: string): string;
	public abstract readFileSync(path: string): Buffer;
	public abstract readFileSync(path: string, encoding?: string): string | Buffer;
	public abstract readDir(path: string): Promise<string[]>;
	public abstract readDirSync(path: string): string[];
	public abstract stat(path: string): Promise<FileSystemEntryStatus>;
	public abstract statSync(path: string): FileSystemEntryStatus;
	public abstract writeFile(path: string, content: string): Promise<void>;
	public abstract writeFileSync(path: string, content: string): void;
	public abstract mkdir(path: string): Promise<void>;
	public abstract mkdirSync(path: string): void;
	public abstract rmdir(path: string): Promise<void>;
	public abstract rmdirSync(path: string): void;
	public abstract unlink(path: string): Promise<void>;
	public abstract unlinkSync(path: string): void;
	public abstract async watch(paths: string[], options: WatchOptions, callback: WatchCallback): Promise<() => void>;
	public abstract watchSync(paths: string[], options: WatchOptions, callback: WatchCallback): () => void;
	public abstract readlink(path: string): Promise<string>;
	public abstract readlinkSync(path: string): string;
	public abstract realpath(path: string): Promise<string>;
	public abstract realpathSync(path: string): string;

	public async glob(directory: string, globPattern: string, options: ReadDirOptions = {}): Promise<string[]> {
		({ directory, globPattern } = this.optimizeGlob(directory, globPattern));
		const candidates = await this.readDirRecursive(directory, options);
		return match(candidates, globPattern);
	}

	public globSync(directory: string, globPattern: string, options: ReadDirOptions = {}): string[] {
		({ directory, globPattern } = this.optimizeGlob(directory, globPattern));
		const candidates = this.readDirRecursiveSync(directory, options);
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

	public async toVirtualFile(filePath: string, parent?: VirtualFolder): Promise<VirtualFile> {
		const content = await this.readFile(filePath, 'utf8');
		return {
			fullPath: filePath,
			content,
			type: FileSystemEntryType.FILE,
			parent
		};
	}

	public readFiles(files: string[], encoding?: string): Promise<string[]> {
		return Promise.all(files.map((f) => this.readFile(f, encoding)));
	}

	public async readFilesIfExist(files: string[], encoding?: string): Promise<string[]> {
		const promises: Promise<string | void>[] = [];
		const results: string[] = [];
		let i = 0;
		for (const file of files) {
			const index: number = i++;
			promises.push(
				this.exists(file).then((exists) => {
					if (exists) {
						return this.readFile(file, encoding).then((content) => {
							results[index] = content;
						});
					} else {
						return undefined;
					}
				})
			);
		}

		await Promise.all(promises);
		return results.filter((p) => p !== undefined);
	}

	public async readFileIfExist(file: string, encoding?: string): Promise<string> {
		if (await this.exists(file)) {
			return this.readFile(file, encoding);
		} else {
			return undefined;
		}
	}

	public readFileIfExistSync(file: string, encoding?: string): string {
		if (this.existsSync(file)) {
			return this.readFileSync(file, encoding);
		} else {
			return undefined;
		}
	}

	public toVirtualFileSync(filePath: string, parent?: VirtualFolder): VirtualFile {
		const content = this.readFileSync(filePath, 'utf8');
		return {
			fullPath: filePath,
			content,
			type: FileSystemEntryType.FILE,
			parent
		};
	}

	public async copyDirectory(source: string, target: string): Promise<void> {
		const files = await this.readDirRecursive(source, {});
		for (const file of files) {
			const newFile = join(target, relative(source, file));
			await this.mkdirp(parse(newFile).dir);
			await this.writeFile(newFile, await this.readFile(file, 'utf8'));
		}
	}

	public copyDirectorySync(source: string, target: string): void {
		const files = this.readDirRecursiveSync(source, {});
		for (const file of files) {
			const newFile = join(target, relative(source, file));
			this.writeFileSync(newFile, this.readFileSync(file, 'utf8'));
		}
	}

	public async copyFile(source: string, target: string): Promise<void> {
		return this.writeFile(target, await this.readFile(source, 'utf8'));
	}

	public copyFileSync(source: string, target: string): void {
		return this.writeFileSync(target, this.readFileSync(source, 'utf8'));
	}

	public async copyFileFileSystem(source: string, targetFileSystem: FileSystem, targetPath: string): Promise<void> {
		return targetFileSystem.writeFile(targetPath, await this.readFile(source, 'utf8'));
	}

	public copyFileFileSystemSync(source: string, targetFileSystem: FileSystem, targetPath: string): void {
		return targetFileSystem.writeFileSync(targetPath, this.readFileSync(source, 'utf8'));
	}

	public async moveFileFileSystem(source: string, targetFileSystem: FileSystem, targetPath: string): Promise<void> {
		await this.copyFileFileSystem(source, targetFileSystem, targetPath);
		await this.unlink(source);
	}

	public moveFileFileSystemSync(source: string, targetFileSystem: FileSystem, targetPath: string): void {
		this.copyFileFileSystemSync(source, targetFileSystem, targetPath);
		this.unlinkSync(source);
	}

	public async hashFiles(paths: string[], includePaths: boolean = true, salt: string = ''): Promise<string> {
		const hashData: string[] = await Promise.all(paths.map((f) => this.readFile(f, 'utf8')));
		hashData.push(salt);
		if (includePaths) {
			hashData.push(paths.sort().join(''));
		}

		return createHash('sha1')
			.update(hashData.join(''))
			.digest('hex');
	}

	private createVirtualFolder(fullPath: string, parent?: VirtualFolder): VirtualFolder {
		return {
			type: FileSystemEntryType.DIRECTORY,
			fullPath,
			parent,
			content: { files: [], folders: [] }
		};
	}

	public async serializeFolder(path: string): Promise<MapLike<VirtualFileSystemEntry>> {
		if (await this.exists(path)) {
			const result: MapLike<VirtualFileSystemEntry> = {};

			const entry = this.createVirtualFolder(path);
			result[path] = entry;
			await this.serializeFolderContent(result, entry);

			return result;
		} else {
			throw new Error(`Path ${path} does not exist`);
		}
	}

	private async serializeFolderContent(map: MapLike<VirtualFileSystemEntry>, entry: VirtualFolder): Promise<void> {
		const contents = await this.readDir(entry.fullPath);
		for (const content of contents) {
			const newPath = join(entry.fullPath, content);
			if ((await this.stat(newPath)).type === FileSystemEntryType.DIRECTORY) {
				const newEntry = this.createVirtualFolder(newPath, entry);
				entry.content.folders.push(newEntry);
				map[newPath] = newEntry;
				this.serializeFolderContent(map, newEntry);
			} else {
				const newEntry = await this.toVirtualFile(newPath, entry);
				entry.content.files.push(newEntry);
				map[newPath] = newEntry;
			}
		}
	}

	public async writeVirtualFile(virtualFile: VirtualFile): Promise<void> {
		this.writeFile(virtualFile.fullPath, virtualFile.content);
	}

	public writeVirtualFileSync(virtualFile: VirtualFile): void {
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
			if ((await this.stat(filePath)).type === FileSystemEntryType.DIRECTORY) {
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
			if (this.statSync(filePath).type === FileSystemEntryType.DIRECTORY) {
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
			if (options.includeDirectories && (await this.stat(file)).type === FileSystemEntryType.DIRECTORY) {
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
			if ((await this.stat(join(path, file))).type === FileSystemEntryType.FILE) {
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
			if (this.statSync(join(path, file)).type === FileSystemEntryType.FILE) {
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
				if (options.matchPartialExtensions) {
					if (options.extensionWhiteList.some((ext) => fp.getExtensionString().endsWith(ext))) {
						results.push(join(path, file));
					}
				} else {
					if (options.extensionWhiteList.includes(fp.getExtensionString())) {
						results.push(join(path, file));
					}
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
			if ((await this.stat(entry)).type === FileSystemEntryType.DIRECTORY) {
				result.push(entry);
			}
		}

		return result;
	}

	public getSubfoldersSync(path: string): string[] {
		return this.readDirSync(path)
			.map((entry) => join(path, entry))
			.filter((entry) => this.statSync(entry).type === FileSystemEntryType.DIRECTORY);
	}
}

function runModule(code: string) {
	const sandboxContext: any = { module: { exports: undefined } };
	vm.createContext(sandboxContext);
	vm.runInContext(`((module) => {${code}})(module)`, sandboxContext);
	return sandboxContext.module.exports;
}
