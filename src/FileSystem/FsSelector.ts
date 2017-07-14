import { IFileSystem, IFsItem } from "./Common";

export class FsSelector implements IFileSystem {
    scheme: string[] = [];

    public filesystems: { [scheme: string]: IFileSystem } = {};

    addFs(fs: IFileSystem) {
        for (var scheme of fs.scheme)
            this.filesystems[scheme] = fs;
    }

    getFs(uri: string): IFileSystem {
        var scheme = uri.split("://")[0];
        var fs = this.filesystems[scheme];
        if (!fs)
            throw `FileSystem not found for uri: ${uri}`;
        return fs;
    }

    capabilities(uri: string) {
        return this.getFs(uri).capabilities(uri);
    };

    createFolder(uri: string): Promise<void> {
        return this.getFs(uri).createFolder(uri);
    }

    read(uri: string): Promise<ArrayBufferLike> {
        return this.getFs(uri).read(uri);
    }

    write(uri: string, data: ArrayBufferLike): Promise<void> {
        return this.getFs(uri).write(uri, data);
    }

    delete(uri: string): Promise<void> {
        return this.getFs(uri).delete(uri);
    }

    list(uri: string): Promise<IFsItem[]> {
        return this.getFs(uri).list(uri);
    }
}