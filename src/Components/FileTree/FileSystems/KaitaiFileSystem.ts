import {FsItemHelper} from "../Utils/FsItemHelper";
import {FileSystem, FileSystemDirectory, ITEM_MODE_ROOT} from "../FileSystemsTypes";
import {FileActionsWrapper} from "../../../Utils/Files/FileActionsWrapper";
import {kaitaiFsFiles} from "../../../kaitaiFsFiles";

export const FILE_SYSTEM_TYPE_KAITAI = "kaitai";

const initKaitaiFs = () => {
    const root = <FileSystemDirectory>{storeId: FILE_SYSTEM_TYPE_KAITAI, children: {}, name: "kaitai.io", type: ITEM_MODE_ROOT};
    (kaitaiFsFiles || []).forEach(path => FsItemHelper.createFileOrDirectoryFromPathInRoot(root, path));
    return root;
};

const kaitaiRoot = initKaitaiFs();

export class KaitaiFileSystem implements FileSystem {

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

    listAllFilesInPath(path: string, returnRelativePaths: boolean): Promise<string[]> {
        return Promise.reject("KaitaiFileSystem.listAllFilesInPath is not supported!");
    }

    move(oldPath: string, newPath: string): Promise<void> {
        return Promise.reject("KaitaiFileSystem.move is not supported!");
    }
}


