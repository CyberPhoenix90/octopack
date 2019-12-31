import { FileSystem, FileSystemEntryData } from '../file_system';
import { exists, existsSync, readFile, readFileSync, readdirSync, readdir, statSync, stat } from 'fs';

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
	public stat(path: string): Promise<FileSystemEntryData> {
		return new Promise((resolve, reject) => {
			return stat(path, (err, data) => {
				if (err) {
					reject(err);
				}
				resolve({
					isDirectory: data.isDirectory(),
					isFile: data.isFile()
				});
			});
		});
	}
	public statSync(path: string): FileSystemEntryData {
		const data = statSync(path);
		return {
			isDirectory: data.isDirectory(),
			isFile: data.isFile()
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
