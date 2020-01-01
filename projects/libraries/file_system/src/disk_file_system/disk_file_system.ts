import { FileSystem, FileSystemEntryData } from '../file_system';
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
	rmdirSync
} from 'fs';

export class DiskFileSystem extends FileSystem {
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

	public stat(path: string): Promise<FileSystemEntryData> {
		return new Promise((resolve, reject) => {
			return stat(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve({
					isDirectory: data.isDirectory(),
					isFile: data.isFile(),
					isBlockDevice: data.isBlockDevice(),
					isCharacterDevice: data.isCharacterDevice(),
					isFIFO: data.isFIFO(),
					isSocket: data.isSocket(),
					isSymbolicLink: data.isSymbolicLink(),
					size: data.size
				});
			});
		});
	}
	public statSync(path: string): FileSystemEntryData {
		const data = statSync(path);
		return {
			isDirectory: data.isDirectory(),
			isFile: data.isFile(),
			isBlockDevice: data.isBlockDevice(),
			isCharacterDevice: data.isCharacterDevice(),
			isFIFO: data.isFIFO(),
			isSocket: data.isSocket(),
			isSymbolicLink: data.isSymbolicLink(),
			size: data.size
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

	public readFileSync(path: string, encoding: string = 'utf8'): string {
		return readFileSync(path, encoding);
	}
}

export const localDiskFileSystem = new DiskFileSystem();
