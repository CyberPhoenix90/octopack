import { FileSystem } from '../file_system';

export class DiskFileSystem extends FileSystem {}

export const localDiskFileSystem = new DiskFileSystem();
