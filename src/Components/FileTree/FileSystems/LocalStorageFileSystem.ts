import {FsItemHelper} from "../Utils/FsItemHelper";
import {FileSystem, FileSystemDirectory, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE, ITEM_MODE_ROOT} from "../FileSystemsTypes";
import {toRaw} from "vue";
import {FileSystemPathCollector} from "../FileSystemVisitors/FileSystemPathCollector";
import {FileSystemDAO} from "../Database/FileSystemDAO";
import {FileSystemNodeFinder} from "../FileSystemVisitors/FileSystemNodeFinder";

export const FILE_SYSTEM_TYPE_LOCAL = "local";
export const FILE_SYSTEM_TYPE_DIST = "dist";


export class LocalStorageFileSystem implements FileSystem {


    constructor(private fileSystemDAO: FileSystemDAO, private root: FileSystemDirectory, public storeId: string) {
    }

    updateTreeInDatabase() {
        return this.fileSystemDAO.saveFileSystemHierarchyRoot(this.storeId, toRaw(this.root));
    }

    getRootNode() {
        return this.root;
    }

    async get(filePath: string): Promise<string | ArrayBuffer> {
        const localForageFileKey = this.formatFileKey(filePath);
        const fileContent = await this.fileSystemDAO.getFile(localForageFileKey);
        if (!fileContent) {
            throw new Error(`File not found: ${filePath}`);
        }
        return fileContent;
    }

    async put(filePath: string, data: string | ArrayBuffer): Promise<void> {
        FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, filePath);
        const localForageFileKey = this.formatFileKey(filePath);
        await this.fileSystemDAO.saveFile(localForageFileKey, data);
        await this.updateTreeInDatabase();
    }

    async createDirectory(filePath: string): Promise<void> {
        FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, filePath, true);
        await this.updateTreeInDatabase();
    }

    async delete(pathToDelete: string) {
        const nodeToDelete = FileSystemNodeFinder.findNode(this.root, pathToDelete);
        switch (nodeToDelete.type) {
            case ITEM_MODE_FILE: {
                await this.deleteNodeAction(pathToDelete);
                await this.executeDeleteFileOnDAO(pathToDelete);
                break;
            }
            case ITEM_MODE_ROOT: {
                const filesToDelete = FileSystemPathCollector.collectPaths(this.root);
                await Promise.all(filesToDelete.map((fileToDelete) => this.executeDeleteFileOnDAO(fileToDelete)));
                this.root.children = {};
                await this.updateTreeInDatabase();
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                const filesToDelete = FileSystemPathCollector.collectPaths(this.root, pathToDelete, false);
                await Promise.all(filesToDelete.map((fileToDelete) => this.executeDeleteFileOnDAO(fileToDelete)));
                await this.deleteNodeAction(pathToDelete);
                break;
            }
        }
    }

    async move(oldPath: string, newPath: string): Promise<void> {
        const oldNode = FileSystemNodeFinder.findNode(this.root, oldPath);
        switch (oldNode.type) {
            case ITEM_MODE_FILE: {
                FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, newPath);
                await this.executeMoveFileOnDAO(oldPath, newPath);
                await this.moveNodeAction(oldPath, newPath);
                break;
            }
            case ITEM_MODE_DIRECTORY: {
                FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, newPath, true);
                const relativePaths = FileSystemPathCollector.collectPaths(this.root, oldPath);
                await Promise.all(relativePaths.map(relativePathToFile => {
                    const oldFilePath = `${oldPath}/${relativePathToFile}`;
                    const newFilePath = `${newPath}/${relativePathToFile}`;
                    return this.executeMoveFileOnDAO(oldFilePath, newFilePath);
                }));
                await this.moveNodeAction(oldPath, newPath);
                break;
            }
        }

        return Promise.resolve();
    }

    listAllFilesInPath(path: string, returnRelativePaths: boolean = true): Promise<string[]> {
        return Promise.resolve(FileSystemPathCollector.collectPaths(this.root, path, returnRelativePaths));
    }

    private formatFileKey(filePath: string) {
        return `${this.storeId}:${filePath}`;
    }

    private async deleteNodeAction(path: string) {
        const nodeToDeleteInfo = FsItemHelper.getInfoAboutPath(this.root, path);
        delete nodeToDeleteInfo.parentNode.children[nodeToDeleteInfo.nodeName];
        await this.updateTreeInDatabase();
    }

    private async executeDeleteFileOnDAO(path: string) {
        const fileToDeleteKey = this.formatFileKey(path);
        await this.fileSystemDAO.deleteFile(fileToDeleteKey);
    }


    private async moveNodeAction(oldPath: string, newPath: string) {
        const oldNodeInfo = FsItemHelper.getInfoAboutPath(this.root, oldPath);
        const newNodeInfo = FsItemHelper.getInfoAboutPath(this.root, newPath);
        delete oldNodeInfo.parentNode.children[oldNodeInfo.nodeName];
        newNodeInfo.parentNode.children[newNodeInfo.nodeName] = oldNodeInfo.node;
        oldNodeInfo.node.name = newNodeInfo.nodeName;
        await this.updateTreeInDatabase();
    }

    private async executeMoveFileOnDAO(oldPath: string, newPath: string) {
        const oldFileForageKey = this.formatFileKey(oldPath);
        const newFileForageKey = this.formatFileKey(newPath);
        const content = await this.fileSystemDAO.getFile(oldFileForageKey);
        await this.fileSystemDAO.saveFile(newFileForageKey, content);
        await this.fileSystemDAO.deleteFile(oldFileForageKey);
    }
}