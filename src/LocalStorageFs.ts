import * as localforage from "localforage";
import { IFileSystem, IFsItem } from "./FsInterfaces";
import FsHelper from "./FsHelper";

export default class LocalStorageFs implements IFileSystem {
    constructor(public prefix: string) { }

    private root: IFsItem;
    private rootPromise: Promise<IFsItem>;
    private filesKey() { return `${this.prefix}_files`; }
    private fileKey(fn) { return `${this.prefix}_file[${fn}]`; }

    private save() { return localforage.setItem(this.filesKey(), this.root); }

    getRootNode() {
        if (this.root)
            return Promise.resolve(this.root);
        this.rootPromise = localforage.getItem<IFsItem>(this.filesKey()).then(x => x || <IFsItem>{ fsType: 'local' }).then(r => this.root = r);
        return this.rootPromise;
    }

    setRootNode(newRoot) {
        this.root = newRoot;
        return this.save();
    }

    get(fn) { return localforage.getItem<string | ArrayBuffer>(this.fileKey(fn)); }

    put(fn, data) {
        return this.getRootNode().then(root => {
            var node = FsHelper.selectNode(root, fn);
            return Promise.all([localforage.setItem(this.fileKey(fn), data), this.save()]).then(x => node);
        });
    }
}