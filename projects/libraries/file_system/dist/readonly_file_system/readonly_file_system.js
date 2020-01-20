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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmVhZG9ubHlfZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvcmVhZG9ubHlfZmlsZV9zeXN0ZW0vcmVhZG9ubHlfZmlsZV9zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBbUU7QUFFbkUsTUFBYSxrQkFBbUIsU0FBUSx3QkFBVTtJQUdqRCxZQUFZLGdCQUE0QjtRQUN2QyxLQUFLLEVBQUUsQ0FBQztRQUNSLElBQUksQ0FBQyxVQUFVLEdBQUcsZ0JBQWdCLENBQUM7SUFDcEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxLQUFlLEVBQUUsT0FBWSxFQUFFLFFBQWE7UUFDeEQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLEtBQUssQ0FBQyxLQUFLLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO0lBQ3hELENBQUM7SUFFTSxTQUFTLENBQUMsS0FBZSxFQUFFLE9BQVksRUFBRSxRQUFhO1FBQzVELE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsQ0FBQztJQUM1RCxDQUFDO0lBRU0sUUFBUSxDQUFDLElBQVk7UUFDM0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ00sWUFBWSxDQUFDLElBQVk7UUFDL0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBQ00sUUFBUSxDQUFDLElBQVk7UUFDM0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBQ00sWUFBWSxDQUFDLElBQVk7UUFDL0IsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMzQyxDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxJQUFZO1FBQzlCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0sU0FBUyxDQUFDLElBQVk7UUFDNUIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxLQUFLLENBQUMsS0FBSyxDQUFDLElBQVk7UUFDOUIsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxTQUFTLENBQUMsSUFBWTtRQUM1QixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLEtBQUssQ0FBQyxNQUFNLENBQUMsSUFBWTtRQUMvQixNQUFNLElBQUksS0FBSyxDQUFDLCtCQUErQixDQUFDLENBQUM7SUFDbEQsQ0FBQztJQUVNLFVBQVUsQ0FBQyxJQUFZO1FBQzdCLE1BQU0sSUFBSSxLQUFLLENBQUMsK0JBQStCLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBRU0sS0FBSyxDQUFDLFFBQVEsQ0FBQyxJQUFZLEVBQUUsUUFBZ0I7UUFDbkQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDakQsQ0FBQztJQUVNLFlBQVksQ0FBQyxJQUFZLEVBQUUsUUFBZ0I7UUFDakQsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFlBQVksQ0FBQyxJQUFJLEVBQUUsUUFBUSxDQUFDLENBQUM7SUFDckQsQ0FBQztJQUVNLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBWTtRQUM3QixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ25DLENBQUM7SUFFTSxRQUFRLENBQUMsSUFBWTtRQUMzQixPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFFTSxLQUFLLENBQUMsT0FBTyxDQUFDLElBQVk7UUFDaEMsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN0QyxDQUFDO0lBRU0sV0FBVyxDQUFDLElBQVk7UUFDOUIsT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLFdBQVcsQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUMxQyxDQUFDO0lBRU0sS0FBSyxDQUFDLE1BQU0sQ0FBQyxJQUFZO1FBQy9CLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDckMsQ0FBQztJQUVNLFVBQVUsQ0FBQyxJQUFZO1FBQzdCLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7SUFDekMsQ0FBQztJQUVNLEtBQUssQ0FBQyxTQUFTLENBQUMsSUFBWSxFQUFFLE9BQWU7UUFDbkQsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7SUFFTSxhQUFhLENBQUMsSUFBWSxFQUFFLE9BQWU7UUFDakQsTUFBTSxJQUFJLEtBQUssQ0FBQywrQkFBK0IsQ0FBQyxDQUFDO0lBQ2xELENBQUM7Q0FDRDtBQTVGRCxnREE0RkMifQ==