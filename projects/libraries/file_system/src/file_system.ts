import * as vm from 'vm';

export abstract class FileSystem {
	public abstract exists(path: string): Promise<boolean>;
	public abstract existsSync(path: string): boolean;
	public abstract readFile(path: string, encoding: string): Promise<string>;
	public abstract readFileSync(path: string, encoding: string): string;

	public async import(path: string): Promise<any> {
		return runModule(await this.readFile(path, 'utf8'));
	}

	public importSync(path: string): any {
		return runModule(this.readFileSync(path, 'utf8'));
	}
}

function runModule(code: string) {
	const sandboxContext: any = { module: { exports: undefined } };
	vm.createContext(sandboxContext);
	vm.runInContext(`((module) => {${code}})(module)`, sandboxContext);
	return sandboxContext.module.exports;
}
