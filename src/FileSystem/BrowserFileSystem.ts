import { FsUri } from "./FsUri";
import { IFileSystem, FsItem } from "./Common";
import * as localforage from "localforage";

export class BrowserFileSystem implements IFileSystem {
    scheme = ["browser"];
    capabilities() { return { write: true, delete: true }; };

    private lfCache: { [name: string]: LocalForage } = {};

    execute<T>(uri: string, action: (localforage: LocalForage, fsUri: FsUri) => Promise<T>) {
        var fsUri = new FsUri(uri, 1);
        var name = "kaitai_files" + (fsUri.fsData[0] ? "_" + fsUri.fsData[0] : "");
        if (!this.lfCache[name])
            this.lfCache[name] = localforage.createInstance({ name: name });
        return action(this.lfCache[name], fsUri);
    }

    async createFolder(uri: string): Promise<void> {
        await this.execute(uri, (lf, fsUri) => lf.setItem(fsUri.path, null));
    }

    read(uri: string): Promise<ArrayBuffer> {
        return this.execute(uri, (lf, fsUri) => lf.getItem(fsUri.path));
    }

    async write(uri: string, data: ArrayBuffer): Promise<void> {
        await this.execute(uri, (lf, fsUri) => lf.setItem(fsUri.path, data));
    }

    async delete(uri: string): Promise<void> {
        await this.execute(uri, (lf, fsUri) => lf.removeItem(fsUri.path));
    }

    list(uri: string): Promise<FsItem[]> {
        return this.execute(uri, async (lf, fsUri) => {
            let keys = await lf.keys();
            return FsUri.getChildUris(keys, fsUri).map(uri => new FsItem(uri));
        });
    }
}

export class BrowserLegacyFileSystem implements IFileSystem {
    scheme = ["browser_legacy"];
    capabilities() { return { write: false, delete: true }; };

    createFolder(uri: string): Promise<void> { throw new Error("Not implemented!");  }
    write(uri: string, data: ArrayBuffer): Promise<void> { throw new Error("Not implemented!"); }

    uriKey(uri: string) { return `fs_file[${new FsUri(uri, 0).path.substr(1)}]`; }

    read(uri: string): Promise<ArrayBuffer> {
        return localforage.getItem(this.uriKey(uri));
    }

    delete(uri: string): Promise<void> {
        return localforage.removeItem(this.uriKey(uri));
    }

    async list(uri: string): Promise<FsItem[]> {
        let keys = await localforage.keys();
        var fsKeys = keys.filter(x => x.startsWith("fs_file[")).map(x => "/" + x.substr(8, x.length - 9));
        return FsUri.getChildUris(fsKeys, new FsUri(uri)).map(uri => new FsItem(uri));
    }
}
