"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
class ReadonlyFileSystem extends file_system_1.FileSystem {
    constructor(sourceFileSystem) {
        super();
        this.fileSystem = sourceFileSystem;
    }
    watch(paths, options, callback) {
        return this.fileSystem.watch(paths, options, callback);
    }
    watchSync(paths, options, callback) {
        return this.fileSystem.watchSync(paths, options, callback);
    }
    readlink(path) {
        return this.fileSystem.readlink(path);
    }
    readlinkSync(path) {
        return this.fileSystem.readlinkSync(path);
    }
    realpath(path) {
        return this.fileSystem.realpath(path);
    }
    realpathSync(path) {
        return this.fileSystem.realpathSync(path);
    }
    async mkdir(path) {
        throw new Error('This file system is read only');
    }
    mkdirSync(path) {
        throw new Error('This file system is read only');
    }
    async rmdir(path) {
        throw new Error('This file system is read only');
    }
    rmdirSync(path) {
        throw new Error('This file system is read only');
    }
    async unlink(path) {
        throw new Error('This file system is read only');
    }
    unlinkSync(path) {
        throw new Error('This file system is read only');
    }
    async readFile(path, encoding) {
        return this.fileSystem.readFile(path, encoding);
    }
    readFileSync(path, encoding) {
        return this.fileSystem.readFileSync(path, encoding);
    }
    async stat(path) {
        return this.fileSystem.stat(path);
    }
    statSync(path) {
        return this.fileSystem.statSync(path);
    }
    async readDir(path) {
        return this.fileSystem.readDir(path);
    }
    readDirSync(path) {
        return this.fileSystem.readDirSync(path);
    }
    async exists(path) {
        return this.fileSystem.exists(path);
    }
    existsSync(path) {
        return this.fileSystem.existsSync(path);
    }
    async writeFile(path, content) {
        throw new Error('This file system is read only');
    }
    writeFileSync(path, content) {
        throw new Error('This file system is read only');
    }
}
exports.ReadonlyFileSystem = ReadonlyFileSystem;