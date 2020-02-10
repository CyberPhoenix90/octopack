"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
const path_1 = require("path");
class CachedFileSystem extends file_system_1.FileSystem {
    constructor(sourceFileSystem, cacheFileSystem) {
        super();
        this.fileSystem = sourceFileSystem;
        this.cacheFileSystem = cacheFileSystem;
    }
    watch(paths, options, callback) {
        throw new Error('Method not implemented.');
    }
    watchSync(paths, options, callback) {
        throw new Error('Method not implemented.');
    }
    async readlink(path) {
        return (await this.cacheFileSystem.readlink(path)) || (await this.fileSystem.readlink(path));
    }
    readlinkSync(path) {
        return this.cacheFileSystem.readlinkSync(path) || this.fileSystem.readlinkSync(path);
    }
    async realpath(path) {
        return (await this.cacheFileSystem.realpath(path)) || (await this.fileSystem.realpath(path));
    }
    realpathSync(path) {
        return this.cacheFileSystem.realpathSync(path) || this.fileSystem.realpathSync(path);
    }
    async cache(path) {
        if (await this.fileSystem.exists(path)) {
            const stat = await this.fileSystem.stat(path);
            if (stat.type === file_system_1.FileSystemEntryType.DIRECTORY) {
                await this.cacheFileSystem.mkdirp(path);
                const files = await this.fileSystem.readDir(path);
                for (const file of files) {
                    await this.cache(path_1.join(path, file));
                }
            }
            else {
                await this.cacheFileSystem.mkdirp(path_1.parse(path).dir);
                return this.copyFileFileSystem(path, this.cacheFileSystem, path);
            }
        }
    }
    cacheSync(path) {
        if (this.fileSystem.existsSync(path)) {
            const stat = this.fileSystem.statSync(path);
            if (stat.type === file_system_1.FileSystemEntryType.DIRECTORY) {
                this.cacheFileSystem.mkdirpSync(path);
                const files = this.fileSystem.readDirSync(path);
                for (const file of files) {
                    this.cacheSync(path_1.join(path, file));
                }
            }
            else {
                this.cacheFileSystem.mkdirp(path_1.parse(path).dir);
                return this.copyFileFileSystemSync(path, this.cacheFileSystem, path);
            }
        }
    }
    async flushCache() {
        const files = await this.cacheFileSystem.readDirRecursive('/', {});
        for (const file of files) {
            await this.fileSystem.mkdirp(path_1.parse(file).dir);
            await this.cacheFileSystem.moveFileFileSystem(file, this.fileSystem, file);
        }
    }
    flushCacheSync() {
        const files = this.cacheFileSystem.readDirRecursiveSync('/', {});
        for (const file of files) {
            this.fileSystem.mkdirpSync(path_1.parse(file).dir);
            this.cacheFileSystem.moveFileFileSystemSync(file, this.fileSystem, file);
        }
    }
    async mkdir(path) {
        if (!this.fileSystem.exists(path)) {
            return this.cacheFileSystem.mkdir(path);
        }
        else {
            await this.cacheFileSystem.mkdirp(path);
        }
    }
    mkdirSync(path) {
        if (!this.fileSystem.exists(path)) {
            return this.cacheFileSystem.mkdirSync(path);
        }
        else {
            this.cacheFileSystem.mkdirpSync(path);
        }
    }
    async rmdir(path) {
        if (await this.cacheFileSystem.exists(path)) {
            this.cacheFileSystem.rmdir(path);
        }
        if (await this.fileSystem.exists(path)) {
            this.fileSystem.rmdir(path);
        }
    }
    rmdirSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            this.cacheFileSystem.rmdirSync(path);
        }
        if (this.fileSystem.existsSync(path)) {
            this.fileSystem.rmdirSync(path);
        }
    }
    async unlink(path) {
        if (await this.cacheFileSystem.exists(path)) {
            this.cacheFileSystem.unlink(path);
        }
        if (await this.fileSystem.exists(path)) {
            this.fileSystem.unlink(path);
        }
    }
    unlinkSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            this.cacheFileSystem.unlinkSync(path);
        }
        if (this.fileSystem.existsSync(path)) {
            this.fileSystem.unlinkSync(path);
        }
    }
    async readFile(path, encoding) {
        if (await this.cacheFileSystem.exists(path)) {
            return this.cacheFileSystem.readFile(path, encoding);
        }
        else {
            return this.fileSystem.readFile(path, encoding);
        }
    }
    readFileSync(path, encoding) {
        if (this.cacheFileSystem.existsSync(path)) {
            return this.cacheFileSystem.readFileSync(path, encoding);
        }
        else {
            return this.fileSystem.readFileSync(path, encoding);
        }
    }
    async stat(path) {
        if (await this.cacheFileSystem.exists(path)) {
            return this.cacheFileSystem.stat(path);
        }
        else {
            return this.fileSystem.stat(path);
        }
    }
    statSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            return this.cacheFileSystem.statSync(path);
        }
        else {
            return this.fileSystem.statSync(path);
        }
    }
    async readDir(path) {
        if (await this.cacheFileSystem.exists(path)) {
            return this.cacheFileSystem.readDir(path);
        }
        else {
            return this.fileSystem.readDir(path);
        }
    }
    readDirSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            return this.cacheFileSystem.readDirSync(path);
        }
        else {
            return this.fileSystem.readDirSync(path);
        }
    }
    async exists(path) {
        if (await this.cacheFileSystem.exists(path)) {
            return true;
        }
        else {
            return this.fileSystem.exists(path);
        }
    }
    existsSync(path) {
        if (this.cacheFileSystem.existsSync(path)) {
            return true;
        }
        else {
            return this.fileSystem.existsSync(path);
        }
    }
    async writeFile(path, content) {
        const folder = path_1.parse(path).dir;
        if (await this.exists(folder)) {
            if (!(await this.cacheFileSystem.exists(folder))) {
                await this.cacheFileSystem.mkdirp(folder);
            }
            return this.cacheFileSystem.writeFile(path, content);
        }
    }
    writeFileSync(path, content) {
        const folder = path_1.parse(path).dir;
        if (this.existsSync(folder)) {
            if (!this.cacheFileSystem.existsSync(folder)) {
                this.cacheFileSystem.mkdirpSync(folder);
            }
            this.cacheFileSystem.writeFileSync(path, content);
        }
    }
}
exports.CachedFileSystem = CachedFileSystem;