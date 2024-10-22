import {FsItemHelper} from "../Utils/FsItemHelper";
import {FileSystem, FileSystemItem, ITEM_MODE_DIRECTORY, ITEM_MODE_FILE} from "../FileSystemsTypes";
import {LocalForageForLocalStorageWrapper} from "../Utils/LocalForageForLocalStorageWrapper";
import {toRaw} from "vue";
import {FileSystemPathCollector} from "../FileSystemVisitors/FileSystemPathCollector";

export const FILE_SYSTEM_TYPE_LOCAL = "local";

const defaultItem: FileSystemItem = {
    fsType: FILE_SYSTEM_TYPE_LOCAL,
    type: ITEM_MODE_DIRECTORY,
    children: {},
    fn: "Local storage"
};

export const initStorageFileSystemRoot = async () => {
    const storedItem = await LocalForageForLocalStorageWrapper.getFsItem(LocalStorageFileSystem.fileTreeLocalForageKey());
    if (storedItem) {
        storedItem.fn = "Local storage";
    }
    return storedItem || defaultItem;
};

export class LocalStorageFileSystem implements FileSystem {
    public static fileTreeLocalForageKey() {
        return `fs_files`;
    }

    public static fileLocalForageKey(fileName: string) {
        return `fs_file[${fileName}]`;
    }

    private static getOnlyFileName(filePath: string) {
        const filePathParts = filePath.split("/");
        return filePathParts[filePathParts.length - 1];
    }

    public storeId: string;

    constructor(private root: FileSystemItem) {
        this.storeId = FILE_SYSTEM_TYPE_LOCAL;
    }

    updateTreeInDatabase() {
        return LocalForageForLocalStorageWrapper.saveFsItem(LocalStorageFileSystem.fileTreeLocalForageKey(), toRaw(this.root));
    }

    getRootNode() {
        return this.root;
    }

    async get(filePath: string): Promise<string | ArrayBuffer> {
        const fileName = LocalStorageFileSystem.getOnlyFileName(filePath);
        const fileContent = await LocalForageForLocalStorageWrapper.getFile(LocalStorageFileSystem.fileLocalForageKey(fileName));
        if (!fileContent) {
            throw new Error(`File not found: ${filePath}`);
        }
        return fileContent;
    }

    async put(filePath: string, data: string | ArrayBuffer): Promise<void> {
        FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, filePath);
        const fileName = LocalStorageFileSystem.getOnlyFileName(filePath);
        await LocalForageForLocalStorageWrapper.saveFile(LocalStorageFileSystem.fileLocalForageKey(fileName), data);
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
            LocalForageForLocalStorageWrapper.deleteFile(LocalStorageFileSystem.fileLocalForageKey(fileName));
        });
    }

    async move(oldPath: string, newPath: string): Promise<void> {
        const oldPathInfo = FsItemHelper.getInfoAboutPath(this.root, oldPath);
        FsItemHelper.createFileOrDirectoryFromPathInRoot(this.root, newPath, oldPathInfo.node.type === ITEM_MODE_DIRECTORY);
        const newPathInfo = FsItemHelper.getInfoAboutPath(this.root, newPath);
        delete oldPathInfo.parentNode.children[oldPathInfo.nodeName];
        newPathInfo.parentNode.children[newPathInfo.nodeName] = oldPathInfo.node;
        if (oldPathInfo.node.type === ITEM_MODE_FILE) {
            const oldFileForageKey = LocalStorageFileSystem.fileLocalForageKey(oldPathInfo.nodeName);
            const newFileForageKey = LocalStorageFileSystem.fileLocalForageKey(newPathInfo.nodeName);
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
}