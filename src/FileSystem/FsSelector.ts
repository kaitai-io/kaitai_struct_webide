import { IFileSystem, IFsItem } from './Common';
import { FsUri } from './FsUri';

export class FsSelector implements IFileSystem {
    scheme: string;

    public filesystems: { [scheme: string]: IFileSystem } = {};

    addFs(fs: IFileSystem) {
        this.filesystems[fs.scheme] = fs;
    }

    getFs(uri: string): IFileSystem {
        var scheme = uri.split('://')[0];
        var fs = this.filesystems[scheme];
        if (!fs)
            throw `FileSystem not found for uri: ${uri}`;
        return fs;
    }

    read(uri: string): Promise<ArrayBuffer> {
        return this.getFs(uri).read(uri);
    }

    write(uri: string, data: ArrayBuffer): Promise<void> {
        return this.getFs(uri).write(uri, data);
    }

    delete(uri: string): Promise<void> {
        return this.getFs(uri).delete(uri);
    }

    list(uri: string): Promise<IFsItem[]> {
        return this.getFs(uri).list(uri);
    }
}