"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
class UnionFileSystem extends file_system_1.FileSystem {
    constructor(fileSystems) {
        super();
        this.fileSystems = fileSystems;
    }
    async watch(paths, options, callback) {
        throw new Error('Not implemented');
    }
    watchSync(paths, options, callback) {
        throw new Error('Not implemented');
    }
    async readlink(path) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.readlink(path);
            }
            catch (e) { }
        }
        throw {
            errno: -22,
            code: 'EINVAL',
            syscall: 'readlink',
            path
        };
    }
    readlinkSync(path) {
        for (const fs of this.fileSystems) {
            try {
                return fs.readlinkSync(path);
            }
            catch (e) { }
        }
        throw {
            errno: -22,
            code: 'EINVAL',
            syscall: 'readlink',
            path
        };
    }
    async realpath(path) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.realpath(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    realpathSync(path) {
        for (const fs of this.fileSystems) {
            try {
                return fs.realpathSync(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    async mkdir(path) {
        for (const fs of this.fileSystems) {
            try {
                await fs.mkdir(path);
            }
            catch (e) { }
        }
    }
    mkdirSync(path) {
        for (const fs of this.fileSystems) {
            try {
                fs.mkdirSync(path);
            }
            catch (e) { }
        }
    }
    async rmdir(path) {
        for (const fs of this.fileSystems) {
            try {
                await fs.rmdir(path);
            }
            catch (e) { }
        }
    }
    rmdirSync(path) {
        for (const fs of this.fileSystems) {
            try {
                fs.rmdirSync(path);
            }
            catch (e) { }
        }
    }
    async unlink(path) {
        for (const fs of this.fileSystems) {
            await fs.unlink(path);
        }
    }
    unlinkSync(path) {
        for (const fs of this.fileSystems) {
            fs.unlinkSync(path);
        }
    }
    async readFile(path, encoding) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.readFile(path, encoding);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    readFileSync(path, encoding) {
        for (const fs of this.fileSystems) {
            try {
                return fs.readFileSync(path, encoding);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    async stat(path) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.stat(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    statSync(path) {
        for (const fs of this.fileSystems) {
            try {
                return fs.statSync(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    async readDir(path) {
        for (const fs of this.fileSystems) {
            try {
                return await fs.readDir(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    readDirSync(path) {
        for (const fs of this.fileSystems) {
            try {
                return fs.readDirSync(path);
            }
            catch (e) { }
        }
        throw new Error(`No such path ${path}`);
    }
    async exists(path) {
        for (const fs of this.fileSystems) {
            if (await fs.exists(path)) {
                return true;
            }
        }
        return false;
    }
    existsSync(path) {
        for (const fs of this.fileSystems) {
            if (fs.existsSync(path)) {
                return true;
            }
        }
        return false;
    }
    async writeFile(path, content) {
        for (const fs of this.fileSystems) {
            try {
                await fs.writeFile(path, content);
            }
            catch (e) { }
        }
    }
    writeFileSync(path, content) {
        for (const fs of this.fileSystems) {
            try {
                fs.writeFileSync(path, content);
            }
            catch (e) { }
        }
    }
}
exports.UnionFileSystem = UnionFileSystem;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidW5pb25fZmlsZV9zeXN0ZW0uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvdW5pb25fZmlsZV9zeXN0ZW0vdW5pb25fZmlsZV9zeXN0ZW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSxnREFBZ0c7QUFFaEcsTUFBYSxlQUFnQixTQUFRLHdCQUFVO0lBRzlDLFlBQVksV0FBeUI7UUFDcEMsS0FBSyxFQUFFLENBQUM7UUFDUixJQUFJLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQztJQUNoQyxDQUFDO0lBRU0sS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFlLEVBQUUsT0FBcUIsRUFBRSxRQUF1QjtRQUNqRixNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLFNBQVMsQ0FBQyxLQUFlLEVBQUUsT0FBcUIsRUFBRSxRQUF1QjtRQUMvRSxNQUFNLElBQUksS0FBSyxDQUFDLGlCQUFpQixDQUFDLENBQUM7SUFDcEMsQ0FBQztJQUVNLEtBQUssQ0FBQyxRQUFRLENBQUMsSUFBWTtRQUNqQyxLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEMsSUFBSTtnQkFDSCxPQUFPLE1BQU0sRUFBRSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQzthQUMvQjtZQUFDLE9BQU8sQ0FBQyxFQUFFLEdBQUU7U0FDZDtRQUVELE1BQU07WUFDTCxLQUFLLEVBQUUsQ0FBQyxFQUFFO1lBQ1YsSUFBSSxFQUFFLFFBQVE7WUFDZCxPQUFPLEVBQUUsVUFBVTtZQUNuQixJQUFJO1NBQ0osQ0FBQztJQUNILENBQUM7SUFFTSxZQUFZLENBQUMsSUFBWTtRQUMvQixLQUFLLE1BQU0sRUFBRSxJQUFJLElBQUksQ0FBQyxXQUFXLEVBQUU7WUFDbEMsSUFBSTtnQkFDSCxPQUFPLEVBQUUsQ0FBQyxZQUFZLENBQUMsSUFBSSxDQUFDLENBQUM7YUFDN0I7WUFBQyxPQUFPLENBQUMsRUFB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