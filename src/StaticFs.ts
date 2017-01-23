import { IFileSystem, IFsItem } from "./FsInterfaces";

export default class StaticFs implements IFileSystem {
    public files: { [fn: string]: string };
    constructor() { this.files = {}; }
    getRootNode() { return Promise.resolve(Object.keys(this.files).map(fn => <IFsItem>{ fsType: 'static', type: 'file', fn })); }
    get(fn) { return Promise.resolve(this.files[fn]); }
    put(fn, data) { this.files[fn] = data; return Promise.resolve(); }
}