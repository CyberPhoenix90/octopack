"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
(function (RemoteFileSystemOperation) {
    RemoteFileSystemOperation[RemoteFileSystemOperation["MK_DIR"] = 0] = "MK_DIR";
    RemoteFileSystemOperation[RemoteFileSystemOperation["RM_DIR"] = 1] = "RM_DIR";
    RemoteFileSystemOperation[RemoteFileSystemOperation["UNLINK"] = 2] = "UNLINK";
    RemoteFileSystemOperation[RemoteFileSystemOperation["WRITEFILE"] = 3] = "WRITEFILE";
    RemoteFileSystemOperation[RemoteFileSystemOperation["WATCH"] = 4] = "WATCH";
    RemoteFileSystemOperation[RemoteFileSystemOperation["READLINK"] = 5] = "READLINK";
    RemoteFileSystemOperation[RemoteFileSystemOperation["REALPATH"] = 6] = "REALPATH";
    RemoteFileSystemOperation[RemoteFileSystemOperation["READFILE"] = 7] = "READFILE";
    RemoteFileSystemOperation[RemoteFileSystemOperation["STAT"] = 8] = "STAT";
    RemoteFileSystemOperation[RemoteFileSystemOperation["READDIR"] = 9] = "READDIR";
    RemoteFileSystemOperation[RemoteFileSystemOperation["EXISTS"] = 10] = "EXISTS";
})(exports.RemoteFileSystemOperation || (exports.RemoteFileSystemOperation = {}));
class RemoteFileSystem extends file_system_1.FileSystem {
    constructor(sendOperation) {
        super();
        this.sendOperation = sendOperation;
    }
    watch(paths, options, callback) {
        return this.sendOperation(exports.RemoteFileSystemOperation.WATCH, [paths, options, callback]);
    }
    watchSync(paths, options, callback) {
        throw new Error('Remote file system does not support sync operations');
    }
    readlink(path) {
        return this.sendOperation(exports.RemoteFileSystemOperation.READLINK, [path]);
    }
    readlinkSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    realpath(path) {
        return this.sendOperation(exports.RemoteFileSystemOperation.REALPATH, [path]);
    }
    realpathSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async mkdir(path) {
        return this.sendOperation(exports.RemoteFileSystemOperation.MK_DIR, [path]);
    }
    mkdirSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async rmdir(path) {
        return this.sendOperation(exports.RemoteFileSystemOperation.RM_DIR, [path]);
    }
    rmdirSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async unlink(path) {
        return this.sendOperation(exports.RemoteFileSystemOperation.UNLINK, [path]);
    }
    unlinkSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async readFile(path, encoding) {
        return this.sendOperation(exports.RemoteFileSystemOperation.READFILE, [path, encoding]);
    }
    readFileSync(path, encoding) {
        throw new Error('Remote file system does not support sync operations');
    }
    async stat(path) {
        return this.sendOperation(exports.RemoteFileSystemOperation.STAT, [path]);
    }
    statSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async readDir(path) {
        return this.sendOperation(exports.RemoteFileSystemOperation.READDIR, [path]);
    }
    readDirSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async exists(path) {
        return this.sendOperation(exports.RemoteFileSystemOperation.EXISTS, [path]);
    }
    existsSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async writeFile(path, content) {
        return this.sendOperation(exports.RemoteFileSystemOperation.WRITEFILE, [path, content]);
    }
    writeFileSync(path, content) {
        throw new Error('Remote file system does not support sync operations');
    }
}
exports.RemoteFileSystem = RemoteFileSystem;