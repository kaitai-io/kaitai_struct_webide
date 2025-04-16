import {FsItemHelper} from "../Utils/FsItemHelper";
import {FileSystem, FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "../FileSystemsTypes";
import {LocalForageForLocalStorageWrapper} from "../Utils/LocalForageForLocalStorageWrapper";
import {toRaw} from "vue";
import {FileSystemPathCollector} from "../FileSystemVisitors/FileSystemPathCollector";

export const FILE_SYSTEM_TYPE_LOCAL = "local";
export const FILE_SYSTEM_TYPE_DIST = "dist";


export class LocalStorageFileSystem implements FileSystem {


    private static getOnlyFileName(filePath: string) {
        const filePathParts = filePath.split("/");
        return filePathParts[filePathParts.length - 1];
    }

    constructor(private root: FileSystemItem, public storeId: string, private rootKey: string, private fileKey: string) {
    }

    updateTreeInDatabase() {
        const localForageRootKey = this.fileTreeLocalForageKey();
        return LocalForageForLocalStorageWrapper.saveFsItem(localForageRootKey, toRaw(this.root));
    }

    getRootNode() {
        return this.root;
    }

    async get(filePath: string): Promise<string | ArrayBuffer> {
        const fileName = LocalStorageFileSystem.getOnlyFileName(filePath);
        const localForageFileKey = this.fileLocalForageKey(fileName);
        const fileContent = await LocalForageForLocalStorageWrapper.getFile(localForageFileKey);
        if (!fileContent) {
            throw new Error(`File not found: ${filePath}`);
        }
        return fileContent;
    }

    async put(filePath: string, data: string | ArrayBuffer): Promise<void> {
        FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, filePath);
        const fileName = LocalStorageFileSystem.getOnlyFileName(filePath);
        const localForageFileKey = this.fileLocalForageKey(fileName);
        await LocalForageForLocalStorageWrapper.saveFile(localForageFileKey, data);
        await this.updateTreeInDatabase();
    }

    async createDirectory(filePath: string): Promise<void> {
        FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, filePath, true);
        await this.updateTreeInDatabase();
    }

    async delete(filePath: string) {
        const filesToDelete = FsItemHelper.deletePathAndReturnFilesToDelete(this.root, filePath);
        await this.updateTreeInDatabase();
        filesToDelete.forEach(fileToDelete => {
            const fileName = LocalStorageFileSystem.getOnlyFileName(fileToDelete);
            const localForageFileKey = this.fileLocalForageKey(fileName);
            LocalForageForLocalStorageWrapper.deleteFile(localForageFileKey);
        });
    }

    async move(oldPath: string, newPath: string): Promise<void> {
        const oldPathInfo = FsItemHelper.getInfoAboutPath(this.root, oldPath);
        FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, newPath, oldPathInfo.node.type === ITEM_MODE_DIRECTORY);
        const newPathInfo = FsItemHelper.getInfoAboutPath(this.root, newPath);
        delete oldPathInfo.parentNode.children[oldPathInfo.nodeName];
        newPathInfo.parentNode.children[newPathInfo.nodeName] = oldPathInfo.node;
        if (oldPathInfo.node.type === ITEM_MODE_FILE) {
            const oldFileForageKey = this.fileLocalForageKey(oldPathInfo.nodeName);
            const newFileForageKey = this.fileLocalForageKey(newPathInfo.nodeName);
            const content = await LocalForageForLocalStorageWrapper.getFile(oldFileForageKey);
            await LocalForageForLocalStorageWrapper.saveFile(newFileForageKey, content);
        }
        await this.updateTreeInDatabase();
        return Promise.resolve(undefined);
    }

    listAllFilesInPath(path: string): Promise<string[]> {
        if (path === "") {
            return Promise.resolve(FileSystemPathCollector.collectPaths(this.root));
        }
        const foundFolder = FsItemHelper.findNodeInRoot(this.root, path.split("/"));
        return Promise.resolve(FileSystemPathCollector.collectPaths(foundFolder));
    }

    private fileTreeLocalForageKey() {
        return this.rootKey;
    }

    private fileLocalForageKey(fileName: string) {
        return `${this.fileKey}[${fileName}]`;
    }
}