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
    stat(path) {
        return new Promise((resolve, reject) => {
            return fs_1.stat(path, (err, data) => {
                if (err) {
                    reject(err);
                }
                resolve({
                    isDirectory: data.isDirectory(),
                    isFile: data.isFile()
                });
            });
        });
    }
    statSync(path) {
        const data = fs_1.statSync(path);
        return {
            isDirectory: data.isDirectory(),
            isFile: data.isFile()
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