import { FileSystem, FileSystemEntryStatus, FileSystemEntryType } from '../file_system';
import {
	exists,
	existsSync,
	readFile,
	readFileSync,
	readdirSync,
	readdir,
	statSync,
	stat,
	writeFile,
	mkdir,
	rmdir,
	unlink,
	writeFileSync,
	mkdirSync,
	rmdirSync,
	Stats,
	readlink,
	realpath,
	readlinkSync,
	realpathSync
} from 'fs';

export class DiskFileSystem extends FileSystem {
	public watch(paths: string[], options: any, callback: any): Promise<() => void> {
		throw new Error('Method not implemented.');
	}
	public watchSync(paths: string[], options: any, callback: any): () => void {
		throw new Error('Method not implemented.');
	}

	public readlink(path: string): Promise<string> {
		return new Promise((resolve, reject) => {
			return readlink(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}
	public readlinkSync(path: string): string {
		return readlinkSync(path);
	}
	public realpath(path: string): Promise<string> {
		return new Promise((resolve, reject) => {
			return realpath(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}
	public realpathSync(path: string): string {
		return realpathSync(path);
	}

	public readDir(path: string): Promise<string[]> {
		return new Promise((resolve, reject) => {
			return readdir(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}

	public readDirSync(path: string): string[] {
		return readdirSync(path);
	}

	public writeFile(path: string, content: string): Promise<void> {
		return new Promise((resolve, reject) => {
			writeFile(path, content, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public writeFileSync(path: string, content: string): void {
		return writeFileSync(path, content);
	}

	public mkdir(path: string): Promise<void> {
		return new Promise((resolve, reject) => {
			mkdir(path, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public mkdirSync(path: string): void {
		return mkdirSync(path);
	}

	public rmdir(path: string): Promise<void> {
		return new Promise((resolve, reject) => {
			rmdir(path, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public rmdirSync(path: string): void {
		return rmdirSync(path);
	}

	public unlink(path: string): Promise<void> {
		return new Promise((resolve, reject) => {
			unlink(path, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public unlinkSync(path: string): Promise<void> {
		return new Promise((resolve, reject) => {
			unlink(path, (err) => {
				if (err) {
					reject(err);
				} else {
					resolve();
				}
			});
		});
	}

	public stat(path: string): Promise<FileSystemEntryStatus> {
		return new Promise((resolve, reject) => {
			return stat(path, (err, data) => {
				if (err) {
					return reject(err);
				}
				resolve(this.mapStatsToFileSystemEntryStatus(data));
			});
		});
	}

	public statSync(path: string): FileSystemEntryStatus {
		const data = statSync(path);
		return this.mapStatsToFileSystemEntryStatus(data);
	}

	private mapStatsToFileSystemEntryStatus(stats: Stats): FileSystemEntryStatus {
		return {
			type: stats.isDirectory() ? FileSystemEntryType.DIRECTORY : FileSystemEntryType.FILE,
			isBlockDevice: stats.isBlockDevice.bind(stats),
			isCharacterDevice: stats.isCharacterDevice.bind(stats),
			isFIFO: stats.isFIFO.bind(stats),
			isSocket: stats.isSocket.bind(stats),
			isSymbolicLink: stats.isSymbolicLink.bind(stats),
			isFile: stats.isFile.bind(stats),
			isDirectory: stats.isDirectory.bind(stats),
			size: stats.size
		};
	}

	public exists(path: string): Promise<boolean> {
		return new Promise((resolve) => {
			return exists(path, (exists) => {
				resolve(exists);
			});
		});
	}

	public existsSync(path: string): boolean {
		return existsSync(path);
	}

	public readFile(path: string, encoding: string = 'utf8'): Promise<string> {
		return new Promise((resolve, reject) => {
			return readFile(path, encoding, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve(data);
			});
		});
	}

	public readFileSync(path: string, encoding: string): string;
	public readFileSync(path: string): Buffer;
	public readFileSync(path: string, encoding?: string): string | Buffer {
		return readFileSync(path, encoding);
	}
}

export const localDiskFileSystem = new DiskFileSystem();
