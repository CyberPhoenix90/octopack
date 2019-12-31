import * as vm from 'vm';
import { join } from 'path';

export interface FileSystemEntryData {
	isDirectory: boolean;
	isFile: boolean;
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
