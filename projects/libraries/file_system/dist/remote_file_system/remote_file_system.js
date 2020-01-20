"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
var RemoteFileSystemOperation;
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
})(RemoteFileSystemOperation = exports.RemoteFileSystemOperation || (exports.RemoteFileSystemOperation = {}));
class RemoteFileSystem extends file_system_1.FileSystem {
    constructor(sendOperation) {
        super();
        this.sendOperation = sendOperation;
    }
    watch(paths, options, callback) {
        return this.sendOperation(RemoteFileSystemOperation.WATCH, [paths, options, callback]);
    }
    watchSync(paths, options, callback) {
        throw new Error('Remote file system does not support sync operations');
    }
    readlink(path) {
        return this.sendOperation(RemoteFileSystemOperation.READLINK, [path]);
    }
    readlinkSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    realpath(path) {
        return this.sendOperation(RemoteFileSystemOperation.REALPATH, [path]);
    }
    realpathSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async mkdir(path) {
        return this.sendOperation(RemoteFileSystemOperation.MK_DIR, [path]);
    }
    mkdirSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async rmdir(path) {
        return this.sendOperation(RemoteFileSystemOperation.RM_DIR, [path]);
    }
    rmdirSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async unlink(path) {
        return this.sendOperation(RemoteFileSystemOperation.UNLINK, [path]);
    }
    unlinkSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async readFile(path, encoding) {
        return this.sendOperation(RemoteFileSystemOperation.READFILE, [path, encoding]);
    }
    readFileSync(path, encoding) {
        throw new Error('Remote file system does not support sync operations');
    }
    async stat(path) {
        return this.sendOperation(RemoteFileSystemOperation.STAT, [path]);
    }
    statSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async readDir(path) {
        return this.sendOperation(RemoteFileSystemOperation.READDIR, [path]);
    }
    readDirSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async exists(path) {
        return this.sendOperation(RemoteFileSystemOperation.EXISTS, [path]);
    }
    existsSync(path) {
        throw new Error('Remote file system does not support sync operations');
    }
    async writeFile(path, content) {
        return this.sendOperation(RemoteFileSystemOperation.WRITEFILE, [path, content]);
    }
    writeFileSync(path, content) {
        throw new Error('Remote file system does not support sync operations');
    }
}
exports.RemoteFileSystem = RemoteFileSystem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVtb3RlX2ZpbGVfc3lzdGVtLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3JlbW90ZV9maWxlX3N5c3RlbS9yZW1vdGVfZmlsZV9zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBbUU7QUFFbkUsSUFBWSx5QkFZWDtBQVpELFdBQVkseUJBQXlCO0lBQ3BDLDZFQUFNLENBQUE7SUFDTiw2RUFBTSxDQUFBO0lBQ04sNkVBQU0sQ0FBQTtJQUNOLG1GQUFTLENBQUE7SUFDVCwyRUFBSyxDQUFBO0lBQ0wsaUZBQVEsQ0FBQTtJQUNSLGlGQUFRLENBQUE7SUFDUixpRkFBUSxDQUFBO0lBQ1IseUVBQUksQ0FBQTtJQUNKLCtFQUFPLENBQUE7SUFDUCw4RUFBTSxDQUFBO0FBQ1AsQ0FBQyxFQVpXLHlCQUF5QixHQUF6QixpQ0FBeUIsS0FBekIsaUNBQXlCLFFBWXBDO0FBRUQsTUFBYSxnQkFBaUIsU0FBUSx3QkFBVTtJQUcvQyxZQUFZLGFBQW1HO1FBQzlHLEtBQUssRUFBRSxDQUFDO1FBQ1IsSUFBSSxDQUFDLGFBQWEsR0FBRyxhQUFhLENBQUM7SUFDcEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFlLEVBQUUsT0FBWSxFQUFFLFFBQWE7UUFDeEQsT0FBTyxJQUFJLENBQUMsYUFBYSxDQUFDLHlCQUF5QixDQUFDLEtBQUssRUFBRSxDQUFDLEtBQUssRUFBRSxPQUFPLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztJQUN4RixDQUFDO0lBRU0sU0FBUyxDQUFDLEtBQWUsRUFBRSxPQUFZLEVBQUUsUUFBYTtRQUM1RCxNQUFNLElBQUksS0FBSyxDQUFDLHFEQUFxRCxDQUFDLENBQUM7SUFDeEUsQ0FBQztJQUVNLFFBQVEsQ0FBQyxJQUFZO1FBQzNCLE9BQU8sSUFBSSxDQUFDLGFBQWEsQ0FBQyx5QkFBeUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO0lBQ3ZFLENBQUM7SUFDTSxZQUFZ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