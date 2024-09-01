import {findOrCreateFsPath} from "./FileSystemHelper";
import {IFileSystem, IFsItem} from "./FileSystemsTypes";
import {LocalForageWrapper} from "../utils/LocalForageWrapper";

export class OldLocalStorageFileSystem implements IFileSystem {
    constructor(root: IFsItem) {
        this.root = root;
    }

    private root: IFsItem;

    private filesKey() {
        return `fs_files`;
    }

    private fileKey(fn: string) {
        return `fs_file[${fn}]`;
    }

    private save() {
        return LocalForageWrapper.saveFsItem(this.filesKey(), this.root);
    }

    getRootNode() {
        return this.root;
    }

    async getRootNodeAsync() {
        return this.root;
    }

    setRootNode(newRoot: IFsItem) {
        this.root = newRoot;
        return this.save();
    }

    get(fn: string): Promise<string | ArrayBuffer> {
        return LocalForageWrapper.getFile(this.fileKey(fn))
            .then(content => {
                if (content === null) {
                    throw new Error("file not found");
                }
                return content;
            });
    }

    put(fn: string, data: any): Promise<IFsItem> {
        return this.getRootNodeAsync().then(root => {
            const node = findOrCreateFsPath(root, fn);
            const saveFileAction = LocalForageWrapper.saveFile(this.fileKey(fn), data);
            const updateFileTreeAction = this.save();
            return Promise.all([saveFileAction, updateFileTreeAction])
                .then(_ => node);
        });
    }
}