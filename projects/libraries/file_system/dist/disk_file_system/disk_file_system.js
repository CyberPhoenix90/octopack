"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
const fs_1 = require("fs");
class DiskFileSystem extends file_system_1.FileSystem {
    readDir(path) {
        return new Promise((resolve, reject) => {
            return fs_1.readdir(path, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    readDirSync(path) {
        return fs_1.readdirSync(path);
    }
    writeFile(path, content) {
        return new Promise((resolve, reject) => {
            fs_1.writeFile(path, content, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    writeFileSync(path, content) {
        return fs_1.writeFileSync(path, content);
    }
    mkdir(path) {
        return new Promise((resolve, reject) => {
            fs_1.mkdir(path, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    mkdirSync(path) {
        return fs_1.mkdirSync(path);
    }
    rmdir(path) {
        return new Promise((resolve, reject) => {
            fs_1.rmdir(path, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    rmdirSync(path) {
        return fs_1.rmdirSync(path);
    }
    unlink(path) {
        return new Promise((resolve, reject) => {
            fs_1.unlink(path, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    unlinkSync(path) {
        return new Promise((resolve, reject) => {
            fs_1.unlink(path, (err) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve();
                }
            });
        });
    }
    stat(path) {
        return new Promise((resolve, reject) => {
            return fs_1.stat(path, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(this.mapStatsToFileSystemEntryStatus(data));
            });
        });
    }
    statSync(path) {
        const data = fs_1.statSync(path);
        return this.mapStatsToFileSystemEntryStatus(data);
    }
    mapStatsToFileSystemEntryStatus(stats) {
        return {
            type: stats.isDirectory() ? file_system_1.FileSystemEntryType.DIRECTORY : file_system_1.FileSystemEntryType.FILE,
            isBlockDevice: stats.isBlockDevice(),
            isCharacterDevice: stats.isCharacterDevice(),
            isFIFO: stats.isFIFO(),
            isSocket: stats.isSocket(),
            isSymbolicLink: stats.isSymbolicLink(),
            size: stats.size
        };
    }
    exists(path) {
        return new Promise((resolve) => {
            return fs_1.exists(path, (exists) => {
                resolve(exists);
            });
        });
    }
    existsSync(path) {
        return fs_1.existsSync(path);
    }
    readFile(path, encoding = 'utf8') {
        return new Promise((resolve, reject) => {
            return fs_1.readFile(path, encoding, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve(data);
            });
        });
    }
    readFileSync(path, encoding = 'utf8') {
        return fs_1.readFileSync(path, encoding);
    }
}
exports.DiskFileSystem = DiskFileSystem;
exports.localDiskFileSystem = new DiskFileSystem();
//# sourceMappingURL=disk_file_system.js.map