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
    }

    async createFolder(uri: string): Promise<void> {
        await this.getFs(uri).createFolder(uri);
    }

    async read(uri: string): Promise<ArrayBufferLike> {
        return await this.getFs(uri).read(uri);
    }

    async write(uri: string, data: ArrayBufferLike): Promise<void> {
        await this.getFs(uri).write(uri, data);
    }

    async delete(uri: string): Promise<void> {
        await this.getFs(uri).delete(uri);
    }

    async list(uri: string): Promise<IFsItem[]> {
        return await this.getFs(uri).list(uri);
    }
}