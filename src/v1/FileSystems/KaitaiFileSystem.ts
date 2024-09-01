import {findOrCreateFsPath} from "./FileSystemHelper";
import {FILE_SYSTEM_TYPE_KAITAI, IFileSystem, IFsItem, ITEM_MODE_DIRECTORY} from "./FileSystemsTypes";
import {FileActionsWrapper} from "../utils/Files/FileActionsWrapper";
import {kaitaiFsFiles} from "../../kaitaiFsFiles";


export class KaitaiFileSystem implements IFileSystem {
    constructor(public files: IFsItem) {
    }

    getRootNode() {
        return this.files;
    }

    getRootNodeAsync() {
        return Promise.resolve(this.files);
    }

    setRootNode(newRoot: IFsItem): Promise<IFsItem> {
        throw "KaitaiFileSystem.setRootNode is not implemented";
    }

    get(fn: string): Promise<string | ArrayBuffer> {
        if (fn.toLowerCase().endsWith(".ksy"))
            return fetch(fn)
                .then(response => {
                    if (!response.ok) {
                        let msg;
                        if (response.status === 404) {
                            msg = "file not found";
                        } else {
                            const textAppendix = response.statusText ? ` (${response.statusText})` : "";
                            msg = `server responded with HTTP status ${response.status}${textAppendix}`;
                        }
                        throw new Error(msg);
                    }
                    return response.text();
                }, err => {
                    if (err instanceof TypeError) {
                        throw new Error(`cannot reach the server (message: ${err.message}), check your internet connection`);
                    }
                    throw err;
                });
        else
            return FileActionsWrapper.downloadFile(fn);
    }

    put(fn: string, data: any) {
        return Promise.reject("KaitaiFileSystem.put is not implemented!");
    }
}

export const initKaitaiFs = () => {
    const kaitaiRoot = <IFsItem>{fsType: FILE_SYSTEM_TYPE_KAITAI, children: {}, fn: "kaitai.io", type: ITEM_MODE_DIRECTORY};
    (kaitaiFsFiles || []).forEach(fn => findOrCreateFsPath(kaitaiRoot, fn));
    return new KaitaiFileSystem(kaitaiRoot);
};

