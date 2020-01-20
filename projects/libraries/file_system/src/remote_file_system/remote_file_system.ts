import { FileSystem, FileSystemEntryStatus } from '../file_system';

export enum RemoteFileSystemOperation {
	MK_DIR,
	RM_DIR,
	UNLINK,
	WRITEFILE,
	WATCH,
	READLINK,
	REALPATH,
	READFILE,
	STAT,
	READDIR,
	EXISTS
}

export class RemoteFileSystem extends FileSystem {
	private sendOperation: (request: RemoteFileSystemOperation, args: Array<string | string[]>) => Promise<any>;

	constructor(sendOperation: (request: RemoteFileSystemOperation, args: Array<string | string[]>) => Promise<any>) {
		super();
		this.sendOperation = sendOperation;
	}

	public watch(paths: string[], options: any, callback: any): Promise<() => void> {
		return this.sendOperation(RemoteFileSystemOperation.WATCH, [paths, options, callback]);
	}

	public watchSync(paths: string[], options: any, callback: any): () => void {
		throw new Error('Remote file system does not support sync operations');
	}

	public readlink(path: string): Promise<string> {
		return this.sendOperation(RemoteFileSystemOperation.READLINK, [path]);
	}
	public readlinkSync(path: string): string {
		throw new Error('Remote file system does not support sync operations');
	}
	public realpath(path: string): Promise<string> {
		return this.sendOperation(RemoteFileSystemOperation.REALPATH, [path]);
	}
	public realpathSync(path: string): string {
		throw new Error('Remote file system does not support sync operations');
	}

	public async mkdir(path: string): Promise<void> {
		return this.sendOperation(RemoteFileSystemOperation.MK_DIR, [path]);
	}

	public mkdirSync(path: string): void {
		throw new Error('Remote file system does not support sync operations');
	}

	public async rmdir(path: string): Promise<void> {
		return this.sendOperation(RemoteFileSystemOperation.RM_DIR, [path]);
	}

	public rmdirSync(path: string): void {
		throw new Error('Remote file system does not support sync operations');
	}

	public async unlink(path: string): Promise<void> {
		return this.sendOperation(RemoteFileSystemOperation.UNLINK, [path]);
	}

	public unlinkSync(path: string): void {
		throw new Error('Remote file system does not support sync operations');
	}

	public async readFile(path: string, encoding: string): Promise<string> {
		return this.sendOperation(RemoteFileSystemOperation.READFILE, [path, encoding]);
	}

	public readFileSync(path: string, encoding: string): string {
		throw new Error('Remote file system does not support sync operations');
	}

	public async stat(path: string): Promise<FileSystemEntryStatus> {
		return this.sendOperation(RemoteFileSystemOperation.STAT, [path]);
	}

	public statSync(path: string): FileSystemEntryStatus {
		throw new Error('Remote file system does not support sync operations');
	}

	public async readDir(path: string): Promise<string[]> {
		return this.sendOperation(RemoteFileSystemOperation.READDIR, [path]);
	}

	public readDirSync(path: string): string[] {
		throw new Error('Remote file system does not support sync operations');
	}

	public async exists(path: string): Promise<boolean> {
		return this.sendOperation(RemoteFileSystemOperation.EXISTS, [path]);
	}

	public existsSync(path: string): boolean {
		throw new Error('Remote file system does not support sync operations');
	}

	public async writeFile(path: string, content: string): Promise<void> {
		return this.sendOperation(RemoteFileSystemOperation.WRITEFILE, [path, content]);
	}

	public writeFileSync(path: string, content: string): void {
		throw new Error('Remote file system does not support sync operations');
	}
}
