import {findOrCreateFsPath} from "./FileSystemHelper";
import {FILE_SYSTEM_TYPE_LOCAL, IFileSystem, IFsItem} from "./FileSystemsTypes";
import {LocalForageWrapper} from "../utils/LocalForageWrapper";

export class OldLocalStorageFileSystem implements IFileSystem {

    public storeId: string;
    private root: IFsItem;

    constructor(root: IFsItem) {
        this.root = root;
        this.storeId = FILE_SYSTEM_TYPE_LOCAL;
    }


    private filesKey() {
        return `fs_files`;
    }

    private fileKey(fn: string) {
        return `fs_file[${fn}]`;
    }

    save(root: IFsItem) {
        return LocalForageWrapper.saveFsItem(this.filesKey(), root);
    }

    getRootNode() {
        return this.root;
    }

    async get(fn: string): Promise<string | ArrayBuffer> {
        return LocalForageWrapper.getFile(this.fileKey(fn))
            .then(content => {
                if (content === null) {
                    throw new Error("file not found");
                }
                return content;
            });
    }

    async put(fn: string, data: string | ArrayBuffer): Promise<IFsItem> {
        const root = this.getRootNode();
        const node = findOrCreateFsPath(root, fn);
        return LocalForageWrapper.saveFile(this.fileKey(fn), data)
            .then(_ => node);
    }
}