"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const wp = require("webpack");
class Webpack {
    createBundle(fileSystem, options) {
        return new Promise((resolve, reject) => {
            var _a;
            const config = {
                mode: (_a = options.mode, (_a !== null && _a !== void 0 ? _a : 'development')),
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
                readFileSync: (path) => fileSystem.readFileSync(path),
                readlinkSync: (path) => fileSystem.readlinkSync(path),
                statSync: (path) => fileSystem.statSync(path),
                readFile: (path, cb) => {
                    fileSystem.readFile(path, 'utf8').then((res) => {
                        cb(undefined, Buffer.from(res));
                    }, (error) => {
                        cb(error, undefined);
                    });
                },
                readlink: (path, cb) => {
                    fileSystem.readlink(path).then((res) => {
                        cb(undefined, res);
                    }, (error) => {
                        cb(error, undefined);
                    });
                },
                stat: (path, cb) => {
                    fileSystem.stat(path).then((res) => {
                        cb(undefined, res);
                    }, (error) => {
                        cb(error, undefined);
                    });
                }
            };
            compiler.outputFileSystem = {
                join: path_1.join,
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
                }
                else if (stats.compilation.assets['bundle.js'] === undefined) {
                    reject(new Error('no output generated'));
                }
                else {
                    resolve(stats.compilation.assets['bundle.js'].source());
                }
            });
        });
    }
}
exports.webpack = new Webpack();