import { IFileSystem, FsItem } from "./Common";
import { FsUri } from "./FsUri";

export class StaticFileSystem implements IFileSystem {
    scheme = ["static"];

    constructor(public files: { [name: string]: ArrayBuffer } = {}) { }

    getUri(uri: string) { return new FsUri(uri, 0, this.scheme[0]); }

    capabilities(uri: string) {
        return { write: true, delete: true };
    };

    createFolder(uri: string): Promise<void> {
        this.files[this.getUri(uri).path] = null;
        return Promise.resolve();
    }

    read(uri: string): Promise<ArrayBuffer> { return Promise.resolve(this.files[this.getUri(uri).path]); }

    write(uri: string, data: ArrayBuffer): Promise<void> {
        this.files[this.getUri(uri).path] = data;
        return Promise.resolve();
    }

    delete(uri: string): Promise<void> {
        delete this.files[this.getUri(uri).path];
        return Promise.resolve();
    }

    list(uri: string): Promise<FsItem[]> {
        return Promise.resolve(FsUri.getChildUris(Object.keys(this.files), this.getUri(uri)).map(uri => new FsItem(uri)));
    }
}