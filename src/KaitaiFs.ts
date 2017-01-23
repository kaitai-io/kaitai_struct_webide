import { IFileSystem } from "./FsInterfaces";

export default class KaitaiFs implements IFileSystem {
    constructor(public files: any) { }

    getRootNode() { return Promise.resolve(this.files); }

    get(fn) {
        if (fn.toLowerCase().endsWith('.ksy'))
            return Promise.resolve<string>($.ajax({ url: fn }));
        else
            return downloadFile(fn);
    }

    put(fn, data) { return Promise.reject('KaitaiFs.put is not implemented!'); }
}