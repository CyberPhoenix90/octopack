import { join } from 'path';
import { MapLike } from '../../../../../typings/common';
import { FileSystem } from 'projects/libraries/file_system/dist';
import * as wp from 'webpack';

export interface BundleOptions {
	entry: string;
	moduleName: string;
	externals: MapLike<string>;
	mode?: 'development' | 'none' | 'production';
}

class Webpack {
	public createBundle(fileSystem: FileSystem, options: BundleOptions): Promise<string> {
		return new Promise((resolve, reject) => {
			const config: wp.Configuration = {
				mode: options.mode ?? 'development',
				entry: options.entry,
				output: {
					filename: 'bundle.js',
					path: '/out',
					library: options.moduleName,
					libraryTarget: 'amd'
				},
				context: '/',
				resolve: {
					extensions: ['.js', '.json']
				},
				externals: options.externals
			};

			const compiler = wp(config);
			compiler.inputFileSystem = {
				readFileSync: (path: string) => fileSystem.readFileSync(path),
				readlinkSync: (path) => fileSystem.readlinkSync(path),
				statSync: (path) => fileSystem.statSync(path),
				readFile: (path: string, cb: any) => {
					fileSystem.readFile(path, 'utf8').then(
						(res) => {
							cb(undefined, Buffer.from(res));
						},
						(error) => {
							cb(error, undefined);
						}
					);
				},
				readlink: (path: string, cb: any) => {
					fileSystem.readlink(path).then(
						(res) => {
							cb(undefined, res);
						},
						(error) => {
							cb(error, undefined);
						}
					);
				},
				stat: (path: string, cb: any) => {
					fileSystem.stat(path).then(
						(res) => {
							cb(undefined, res);
						},
						(error) => {
							cb(error, undefined);
						}
					);
				}
			};

			compiler.outputFileSystem = {
				join,
				mkdir: (path, cb) => cb(undefined),
				mkdirp: (path, cb) => cb(undefined),
				rmdir: (path, cb) => cb(undefined),
				unlink: (path, cb) => cb(undefined),
				writeFile: (path, data, cb) => cb(undefined)
			};
			compiler.context = '/';

			compiler.run(async (err, stats) => {
				if (err) {
					reject(err);
				} else if (stats.compilation.assets['bundle.js'] === undefined) {
					reject(new Error('no output generated'));
				} else {
					resolve(stats.compilation.assets['bundle.js'].source());
				}
			});
		});
	}
}

export const webpack: Webpack = new Webpack();
