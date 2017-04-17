import { IFileSystem, FsItem } from './Common';
import { FsUri } from './FsUri';

export class StaticFileSystem implements IFileSystem {
    scheme: string = 'static';

    constructor(public files: { [name: string]: ArrayBuffer } = {}) { }

    getPath(uri: string) { return new FsUri(uri, 0).path; }

    read(uri: string): Promise<ArrayBuffer> { return Promise.resolve(this.files[this.getPath(uri)]); }

    write(uri: string, data: ArrayBuffer): Promise<void> {
        this.files[this.getPath(uri)] = data;
        return Promise.resolve();
    }

    delete(uri: string): Promise<void> {
        delete this.files[this.getPath(uri)];
        return Promise.resolve();
    }

    list(uri: string): Promise<FsItem[]> {
        return Promise.resolve(FsUri.getChildUris(Object.keys(this.files), new FsUri(uri)).map(uri => new FsItem(uri)));
    }
}