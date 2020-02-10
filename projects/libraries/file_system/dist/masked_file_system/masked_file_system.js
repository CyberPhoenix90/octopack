"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
class MaskedFileSystem extends file_system_1.FileSystem {
    constructor(allowedFiles, sourceFileSystem) {
        super();
        this.fileSystem = sourceFileSystem;
        this.allowedFiles = allowedFiles;
    }
    watch(paths, options, callback) {
        throw new Error('Method not implemented.');
    }
    watchSync(paths, options, callback) {
        throw new Error('Method not implemented.');
    }
    async mkdir(path) {
        this.allowedFiles.add(path);
        return this.fileSystem.mkdir(path);
    }
    mkdirSync(path) {
        this.allowedFiles.add(path);
        return this.fileSystem.mkdirSync(path);
    }
    async rmdir(path) {
        this.allowedFiles.delete(path);
        return this.fileSystem.rmdir(path);
    }
    rmdirSync(path) {
        this.allowedFiles.delete(path);
        return this.fileSystem.rmdirSync(path);
    }
    async unlink(path) {
        this.allowedFiles.delete(path);
        return this.fileSystem.unlink(path);
    }
    unlinkSync(path) {
        this.allowedFiles.delete(path);
        return this.fileSystem.unlinkSync(path);
    }
    async readFile(path, encoding) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.readFile(path, encoding);
        }
        else {
            throw new Error('Access denied');
        }
    }
    readlink(path) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.readlink(path);
        }
        else {
            throw new Error('Access denied');
        }
    }
    readlinkSync(path) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.readlinkSync(path);
        }
        else {
            throw new Error('Access denied');
        }
    }
    realpath(path) {
        return this.fileSystem.realpath(path);
    }
    realpathSync(path) {
        return this.fileSystem.realpathSync(path);
    }
    readFileSync(path, encoding) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.readFileSync(path, encoding);
        }
        else {
            throw new Error('Access denied');
        }
    }
    async stat(path) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.stat(path);
        }
        else {
            throw new Error('Access denied');
        }
    }
    statSync(path) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.statSync(path);
        }
        else {
            throw new Error('Access denied');
        }
    }
    async readDir(path) {
        if (this.allowedFiles.has(path)) {
            return (await this.fileSystem.readDir(path)).filter((p) => this.allowedFiles.has(p));
        }
        else {
            throw new Error('Access denied');
        }
    }
    readDirSync(path) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.readDirSync(path).filter((p) => this.allowedFiles.has(p));
        }
        else {
            throw new Error('Access denied');
        }
    }
    async exists(path) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.exists(path);
        }
        else {
            return false;
        }
    }
    existsSync(path) {
        if (this.allowedFiles.has(path)) {
            return this.fileSystem.existsSync(path);
        }
        else {
            return false;
        }
    }
    async writeFile(path, content) {
        this.allowedFiles.add(path);
        return this.fileSystem.writeFile(path, content);
    }
    writeFileSync(path, content) {
        this.allowedFiles.add(path);
        return this.fileSystem.writeFileSync(path, content);
    }
}
exports.MaskedFileSystem = MaskedFileSystem;