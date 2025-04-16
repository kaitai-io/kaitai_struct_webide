import {FileSystemItem, ITEM_MODE_DIRECTORY} from "../FileSystemsTypes";
import {LocalForageForLocalStorageWrapper} from "../Utils/LocalForageForLocalStorageWrapper";
import {FILE_SYSTEM_TYPE_DIST, FILE_SYSTEM_TYPE_LOCAL, LocalStorageFileSystem} from "./LocalStorageFileSystem";


const defaultLocalStorage: FileSystemItem = {
    fsType: FILE_SYSTEM_TYPE_LOCAL,
    type: ITEM_MODE_DIRECTORY,
    children: {},
    fn: "Local storage"
};

const defaultDistStorage: FileSystemItem = {
    fsType: FILE_SYSTEM_TYPE_DIST,
    type: ITEM_MODE_DIRECTORY,
    children: {},
    fn: "dist"
};

export const initLocalStorageRoot = async () => {
    const storedItem = await LocalForageForLocalStorageWrapper.getFsItem("fs_files");
    if (storedItem) {
        storedItem.fn = "Local storage";
    }
    const localStorageRoot = storedItem || defaultLocalStorage;
    return new LocalStorageFileSystem(localStorageRoot, FILE_SYSTEM_TYPE_LOCAL, "fs_files", "fs_file");
};

export const initDistStorageRoot = async () => {
    const storedItem = await LocalForageForLocalStorageWrapper.getFsItem("fs_dist");
    if (storedItem) {
        storedItem.fn = "dist";
    }
    const distRoot = storedItem || defaultDistStorage;
    return new LocalStorageFileSystem(distRoot, FILE_SYSTEM_TYPE_DIST, "fs_dist", "fs_dist");
};
