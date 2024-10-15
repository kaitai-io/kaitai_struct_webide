import {IFsItemHelper} from "./IFsItemHelper";
import {IFileSystem, IFsItem, ITEM_MODE_DIRECTORY} from "./FileSystemsTypes";
import {FileActionsWrapper} from "../utils/Files/FileActionsWrapper";
import {kaitaiFsFiles} from "../../kaitaiFsFiles";

export const FILE_SYSTEM_TYPE_KAITAI = "kaitai";

const initKaitaiFs = () => {
    const root = <IFsItem>{fsType: FILE_SYSTEM_TYPE_KAITAI, children: {}, fn: "kaitai.io", type: ITEM_MODE_DIRECTORY};
    (kaitaiFsFiles || []).forEach(fn => IFsItemHelper.createFileOrDirectoryFromPathInRoot(root, fn));
    return root;
};

const kaitaiRoot = initKaitaiFs();

export class KaitaiFileSystem implements IFileSystem {

    storeId: string;

    constructor() {
        this.storeId = FILE_SYSTEM_TYPE_KAITAI;
    }

    getRootNode() {
        return kaitaiRoot;
    }

    async get(fn: string): Promise<string | ArrayBuffer> {
        return await FileActionsWrapper.fetchFileFromServer(fn);
    }

    async put(fn: string, data: any) {
        return Promise.reject("KaitaiFileSystem.put is not supported!");
    }

    createDirectory(filePath: string): Promise<void> {
        return Promise.reject("KaitaiFileSystem.createDirectory is not supported!");
    }

    async delete(filePath: string): Promise<void> {
        return Promise.reject("KaitaiFileSystem.delete is not supported!");
    }
}


