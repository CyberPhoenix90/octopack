import { FileSystem } from '../file_system';
import { exists, existsSync, readFile, readFileSync } from 'fs';

export class DiskFileSystem extends FileSystem {
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
