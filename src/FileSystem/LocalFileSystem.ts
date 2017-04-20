import { FsUri } from "./FsUri";
import { IFileSystem, FsItem } from "./Common";
import * as localforage from "localforage";

export class LocalFileSystem implements IFileSystem {
    scheme: string = "local";

    private lfCache: { [name: string]: LocalForage } = {};

    constructor() {
        localforage.createInstance({ name: "kaitai_files" });
    }

    execute<T>(uri: string, action: (localforage: LocalForage, fsUri: FsUri) => Promise<T>) {
        var fsUri = new FsUri(uri, 1);
        var name = "kaitai_files" + (fsUri.fsData[0] ? "_" + fsUri.fsData[0] : "");
        if (!this.lfCache[name])
            this.lfCache[name] = localforage.createInstance({ name: name });
        return action(this.lfCache[name], fsUri);
    }

    read(uri: string): Promise<ArrayBuffer> {
        return this.execute(uri, (lf, fsUri) => lf.getItem(fsUri.path));
    }

    write(uri: string, data: ArrayBuffer): Promise<void> {
        return this.execute(uri, (lf, fsUri) => lf.setItem(fsUri.path, data)).then(x => null);
    }

    delete(uri: string): Promise<void> {
        return this.execute(uri, (lf, fsUri) => lf.removeItem(fsUri.path));
    }

    list(uri: string): Promise<FsItem[]> {
        return this.execute(uri,
            (lf, fsUri) => lf.keys().then(
                keys => FsUri.getChildUris(keys, fsUri).map(uri => new FsItem(uri))));
    }
}
