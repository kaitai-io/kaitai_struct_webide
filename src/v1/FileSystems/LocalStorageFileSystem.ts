import {findOrCreateFsPath} from "./FileSystemHelper";
import {FILE_SYSTEM_TYPE_LOCAL, IFileSystem, IFsItem, IJSTreeNodeHelper, ITEM_MODE_DIRECTORY} from "./FileSystemsTypes";
import {LocalForageWrapper} from "../utils/LocalForageWrapper";

export class LocalStorageFileSystem implements IFileSystem {
    constructor(public prefix: string) {
    }

    private root: IFsItem;

    private filesKey() {
        return `${this.prefix}_files`;
    }

    private fileKey(fn: string) {
        return `${this.prefix}_file[${fn}]`;
    }

    private save() {
        return LocalForageWrapper.saveFsItem(this.filesKey(), this.root);
    }

    async getRootNode() {
        if (!this.root) {
            const defaultItem: IFsItem = {fsType: FILE_SYSTEM_TYPE_LOCAL, type: ITEM_MODE_DIRECTORY, children: {}};
            const storedItem = await LocalForageWrapper.getFsItem(this.filesKey());
            this.root = storedItem || defaultItem;
        }

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
        return this.getRootNode().then(root => {
            const node = findOrCreateFsPath(root, fn);
            const saveFileAction = LocalForageWrapper.saveFile(this.fileKey(fn), data);
            const updateFileTreeAction = this.save();
            return Promise.all([saveFileAction, updateFileTreeAction])
                .then(_ => node);
        });
    }
}

export const initLocalStorageFsTreeData = (): IJSTreeNodeHelper => {
    return {
        text: "Local storage",
        id: "localStorage",
        icon: "glyphicon glyphicon-hdd",
        state: {opened: true},
        children: [],
        data: {
            fsType: FILE_SYSTEM_TYPE_LOCAL,
            type: ITEM_MODE_DIRECTORY
        }
    };
};