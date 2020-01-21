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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlX2ZpbGVfc3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtb3RlX2ZpbGVfc3lzdGVtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLE9BQU8sRUFBRSxVQUFVLEVBQXlCLE1BQU0sZ0JBQWdCLENBQUM7QUFFbkUsTUFBTSxDQUFOLElBQVkseUJBWVg7QUFaRCxXQUFZLHlCQUF5QjtJQUNwQyw2RUFBTSxDQUFBO0lBQ04sNkVBQU0sQ0FBQTtJQUNOLDZFQUFNLENBQUE7SUFDTixtRkFBUyxDQUFBO0lBQ1QsMkVBQUssQ0FBQTtJQUNMLGlGQUFRLENBQUE7SUFDUixpRkFBUSxDQUFBO0lBQ1IsaUZBQVEsQ0FBQTtJQUNSLHlFQUFJLENBQUE7SUFDSiwrRUFBTyxDQUFBO0lBQ1AsOEVBQU0sQ0FBQTtBQUNQLENBQUMsRUFaVyx5QkFBeUIsS0FBekIseUJBQXlCLFFBWXBDO0FBRUQsTUFBTSxPQUFPLGdCQUFpQixTQUFRLFVBQVU7SUFHL0MsWUFBWSxhQUFtRztRQUM5RyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxhQUFhLEdBQUcsYUFBYSxDQUFDO0lBQ3BDLENBQUM7SUFFTSxLQUFLLENBQUMsS0FBZSxFQUFFLE9BQVksRUFBRSxRQUFhO1FBQ3hELE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxLQUFLLEVBQUUsQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7SUFDeEYsQ0FBQztJQUVNLFNBQVMsQ0FBQyxLQUFlLEVBQUUsT0FBWSxFQUFFLFFBQWE7UUFDNUQsTUFBTSxJQUFJLEtBQUssQ0FBQyxxREFBcUQsQ0FBQyxDQUFDO0lBQ3hFLENBQUM7SUFFTSxRQUFRLENBQUMsSUFBWTtRQUMzQixPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMseUJBQXlCLENBQUMsUUFBUSxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQztJQUN2RSxDQUFDO0lBQ00sWUFB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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlX2ZpbGVfc3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmVtb3RlX2ZpbGVfc3lzdGVtLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsZ0RBQTRDO0FBRTVDLENBQUMsVUFBVSx5QkFBeUI7SUFDaEMseUJBQXlCLENBQUMseUJBQXlCLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDO0lBQzlFLHlCQUF5QixDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFFBQVEsQ0FBQztJQUM5RSx5QkFBeUIsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUM7SUFDOUUseUJBQXlCLENBQUMseUJBQXlCLENBQUMsV0FBVyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsV0FBVyxDQUFDO0lBQ3BGLHlCQUF5QixDQUFDLHlCQUF5QixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLE9BQU8sQ0FBQztJQUM1RSx5QkFBeUIsQ0FBQyx5QkFBeUIsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxVQUFVLENBQUM7SUFDbEYseUJBQXlCLENBQUMseUJBQXlCLENBQUMsVUFBVSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsVUFBVSxDQUFDO0lBQ2xGLHlCQUF5QixDQUFDLHlCQUF5QixDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFHLFVBQVUsQ0FBQztJQUNsRix5QkFBeUIsQ0FBQyx5QkFBeUIsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDMUUseUJBQXlCLENBQUMseUJBQXlCLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsU0FBUyxDQUFDO0lBQ2hGLHlCQUF5QixDQUFDLHlCQUF5QixDQUFDLFFBQVEsQ0FBQyxHQUFH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