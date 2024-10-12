import {findOrCreateFsPath} from "./FileSystemHelper";
import {FILE_SYSTEM_TYPE_KAITAI, IFileSystem, IFsItem, ITEM_MODE_DIRECTORY} from "./FileSystemsTypes";
import {FileActionsWrapper} from "../utils/Files/FileActionsWrapper";
import {kaitaiFsFiles} from "../../kaitaiFsFiles";


export class KaitaiFileSystem implements IFileSystem {

    storeId: string;

    constructor(public files: IFsItem) {
        this.storeId = FILE_SYSTEM_TYPE_KAITAI;
    }

    getRootNode() {
        return this.files;
    }

    async get(fn: string): Promise<string | ArrayBuffer> {
        const resp = await FileActionsWrapper.getFileFromServer(fn);
        return fn.toLowerCase().endsWith(".ksy")
            ? resp.text()
            : resp.arrayBuffer();
    }

    async put(fn: string, data: any) {
        return Promise.reject("KaitaiFileSystem.put is not implemented!");
    }

    save(root: IFsItem): void {

    }

}

export const initKaitaiFs = () => {
    const kaitaiRoot = <IFsItem>{fsType: FILE_SYSTEM_TYPE_KAITAI, children: {}, fn: "kaitai.io", type: ITEM_MODE_DIRECTORY};
    (kaitaiFsFiles || []).forEach(fn => findOrCreateFsPath(kaitaiRoot, fn));
    return new KaitaiFileSystem(kaitaiRoot);
};

