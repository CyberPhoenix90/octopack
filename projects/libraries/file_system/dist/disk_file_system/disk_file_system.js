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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlza19maWxlX3N5c3RlbS5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpc2tfZmlsZV9zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBd0Y7QUFDeEYsMkJBaUJZO0FBRVosTUFBYSxjQUFlLFNBQVEsd0JBQVU7SUFDdEMsT0FBTyxDQUFDLElBQVk7UUFDMUIsT0FBTyxJQUFJLE9BQU8sQ0FBQyxDQUFDLE9BQU8sRUFBRSxNQUFNLEVBQUUsRUFBRTtZQUN0QyxPQUFPLFlBQU8sQ0FBQyxJQUFJLEVBQUUsQ0FBQyxHQUFHLEVBQUUsSUFBSSxFQUFFLEVBQUU7Z0JBQ2xDLElBQUksR0FBRyxFQUFFO29CQUNSLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztpQkFDWjtnQkFDRCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7WUFDZixDQUFDLENBQUMsQ0FBQztRQUNKLENBQUMsQ0FBQyxDQUFDO0lBQ0osQ0FBQztJQUVNLFdBQVcsQ0FBQyxJQUFZO1FBQzlCLE9BQU8sZ0JBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQixDQUFDO0lBRU0sU0FBUyxDQUFDLElBQVksRUFBRSxPQUFlO1FBQzdDLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxPQUFPLEVBQUUsTUFBTSxFQUFFLEVBQUU7WUFDdEMsY0FBUyxDQUFDLElBQUksRUFBRSxPQUFPLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRTtnQkFDaEMsSUFBSSxHQUFHLEVBQUU7b0JBQ1IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO2lCQUNaO3FCQUFNO29CQUNOLE9BQU8sRUFBRSxDQUFDO2lCQUNWO1lBQ0YsQ0FBQyxDQUFDLENBQUM7UUFDSixDQUFDLENBQUMsQ0FBQztJQUNKLENBQUM7SUFFTSxhQUFhLENBQUMsSUFBWSxFQUFFLE9BQWU7UUFDakQsT0FBTyxrQkFBYSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBRU0sS0FBSyxDQUFD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