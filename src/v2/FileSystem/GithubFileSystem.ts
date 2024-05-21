import { GithubClient, Repository, Entities } from "./GithubClient";
import { FsUri } from "./FsUri";
import { IFileSystem, IFsItem } from "./Common";

export class GithubFsItem implements IFsItem {
    public repo: Repository;
    public uri: FsUri;

    constructor(public fs: GithubFileSystem, uri: string, public entity?: Entities.IContent) {
        this.uri = new FsUri(uri, 2);
        this.repo = this.fs.client.getRepo(this.uri.fsData[1], this.uri.fsData[0]);
    }

    createFolder(): Promise<void> {
        throw new Error("Not implemented");
    }

    read(): Promise<ArrayBuffer> {
        return this.repo.downloadFile(this.uri.path);
    }

    write(newContent: ArrayBuffer): Promise<void> {
        throw new Error("Not implemented");
    }

    delete(): Promise<void> {
        throw new Error("Not implemented");
    }

    async list(): Promise<IFsItem[]> {
        let items = await this.repo.getContents(this.uri.path);
        return items.filter(item => item.type === "file" || item.type === "dir")
            .map(item => new GithubFsItem(this.fs, this.uri.uri + item.name + (item.type === "dir" ? "/" : ""), item));
    }
}

export class GithubFileSystem implements IFileSystem {
    scheme = ["github"];

    constructor(public client: GithubClient) { }

    getFsItem(uri: string) {
        return new GithubFsItem(this, uri);
    }

    capabilities(uri: string) {
        return { write: true, delete: true };
    };

    createFolder(uri: string): Promise<void> {
        return this.getFsItem(uri).createFolder();
    }

    read(uri: string): Promise<ArrayBuffer> {
        return this.getFsItem(uri).read();
    }

    write(uri: string, data: ArrayBuffer): Promise<void> {
        return this.getFsItem(uri).write(data);
    }

    delete(uri: string): Promise<void> {
        return this.getFsItem(uri).delete();
    }

    list(uri: string): Promise<IFsItem[]> {
        return this.getFsItem(uri).list();
    }
}