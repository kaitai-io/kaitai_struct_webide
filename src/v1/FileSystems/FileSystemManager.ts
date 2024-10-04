import {LocalStorageFileSystem} from "./LocalStorageFileSystem";
import {initKaitaiFs} from "./KaitaiFileSystem";
import {IFileSystemManager} from "./FileSystemsTypes";

const localFs = new LocalStorageFileSystem("fs");
const kaitaiFs = initKaitaiFs();

export var fileSystemsManager: IFileSystemManager = {
    local: localFs,
    kaitai: kaitaiFs
};