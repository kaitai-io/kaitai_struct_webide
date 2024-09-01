import {OldLocalStorageFileSystem} from "./OldLocalStorageFileSystem";
import {initKaitaiFs} from "./KaitaiFileSystem";
import {FILE_SYSTEM_TYPE_LOCAL, IFileSystemManager, IFsItem, ITEM_MODE_DIRECTORY} from "./FileSystemsTypes";
import {LocalForageWrapper} from "../utils/LocalForageWrapper";
const defaultItem: IFsItem = {
    fsType: FILE_SYSTEM_TYPE_LOCAL,
    type: ITEM_MODE_DIRECTORY,
    children: {},
    fn: "Local storage"
};


const kaitaiFs = initKaitaiFs();

export var fileSystemsManager: IFileSystemManager = {
    local: new OldLocalStorageFileSystem(defaultItem),
    kaitai: kaitaiFs
};

LocalForageWrapper.getFsItem(`fs_files`)
    .then(storedItem => {
        if (storedItem) {
            storedItem.fn = "Local storage";
            fileSystemsManager.local = new OldLocalStorageFileSystem(storedItem || defaultItem);
        }
    });
