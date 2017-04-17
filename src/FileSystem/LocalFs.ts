import { FsUri } from './FsUri';
import { IFileSystem, IFsItem } from './Interfaces';
import * as localforage from "localforage";

class LocalFsItem implements IFsItem {
    constructor(public uri: FsUri) { }
}

export class LocalFileSystem implements IFileSystem {
    scheme: string = 'local';

    private lfCache: { [name: string]: LocalForage } = {};

    constructor() {
        localforage.createInstance({ name: "kaitai_files" });
    }

    execute<T>(uri: string, action: (localforage: LocalForage, fsUri: FsUri) => Promise<T>) {
        var fsUri = new FsUri(uri, 1);
        var name = "kaitai_files" + (fsUri.fsData[0] ? '_' + fsUri.fsData[0] : '');
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

    list(uri: string): Promise<LocalFsItem[]> {
        return this.execute(uri, (lf, fsUri) => {
            return lf.keys().then(keys => {
                var itemNames: { [name: string]: boolean } = {};
                keys.filter(x => x.startsWith(fsUri.path)).forEach(key => {
                    var keyParts = key.substr(fsUri.path.length).split('/');
                    var name = keyParts[0] + (keyParts.length === 1 ? '' : '/');
                    itemNames[name] = true;
                });

                return Object.keys(itemNames).map(name => new LocalFsItem(new FsUri(fsUri.uri + name, 1)));
            });
        });
    }
}
