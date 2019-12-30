"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const file_system_1 = require("../file_system");
class DiskFileSystem extends file_system_1.FileSystem {
}
exports.DiskFileSystem = DiskFileSystem;
exports.localDiskFileSystem = new DiskFileSystem();
