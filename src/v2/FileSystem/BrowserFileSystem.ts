import { FsUri } from "./FsUri";
import { IFileSystem, FsItem } from "./Common";
import * as localforage from "localforage";

export class BrowserFileSystem implements IFileSystem {
    scheme = ["browser"];
    capabilities() { return { write: true, delete: true }; }

    private lfCache: { [name: string]: LocalForage } = {};

    prepare(uri: string) {
        var fsUri = new FsUri(uri, 1);
        var name = "kaitai_files" + (fsUri.fsData[0] ? "_" + fsUri.fsData[0] : "");
        if (!this.lfCache[name])
            this.lfCache[name] = localforage.createInstance({ name: name });
        return { lf: this.lfCache[name], fsUri };
    }

    async createFolder(uri: string): Promise<void> {
        var { lf, fsUri } = this.prepare(uri);
        await lf.setItem(fsUri.path, null);
    }

    async read(uri: string): Promise<ArrayBuffer> {
        var { lf, fsUri } = this.prepare(uri);
        return await lf.getItem<ArrayBuffer>(fsUri.path);
    }

    async write(uri: string, data: ArrayBuffer): Promise<void> {
        var { lf, fsUri } = this.prepare(uri);
        await lf.setItem(fsUri.path, data);
    }

    async delete(uri: string): Promise<void> {
        var { lf, fsUri } = this.prepare(uri);
        if (fsUri.type === "directory") {
            const keys = await lf.keys();
            const itemsToDelete = keys.filter(key => key.startsWith(fsUri.path));
            for (const itemToDelete of itemsToDelete)
                await lf.removeItem(itemToDelete);
        } else
            await lf.removeItem(fsUri.path);
    }

    async list(uri: string): Promise<FsItem[]> {
        var { lf, fsUri } = this.prepare(uri);
        let keys = await lf.keys();
        return FsUri.getChildUris(keys, fsUri).map(childUri => new FsItem(childUri));
    }
}

export class BrowserLegacyFileSystem implements IFileSystem {
    scheme = ["browser_legacy"];
    capabilities() { return { write: false, delete: true }; }

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
        return FsUri.getChildUris(fsKeys, new FsUri(uri)).map(childUri => new FsItem(childUri));
    }
}
