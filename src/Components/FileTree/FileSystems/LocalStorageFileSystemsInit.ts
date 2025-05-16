import {FileSystemDirectory, ITEM_MODE_ROOT} from "../FileSystemsTypes";
import {FILE_SYSTEM_TYPE_DIST, FILE_SYSTEM_TYPE_LOCAL, LocalStorageFileSystem} from "./LocalStorageFileSystem";
import {FileSystemDAO} from "../Database/FileSystemDAO";
import {fileSystemLocalForageDAO} from "../Database/FileSystemLocalForageDAO";


const defaultLocalStorage: FileSystemDirectory = {
    storeId: FILE_SYSTEM_TYPE_LOCAL,
    type: ITEM_MODE_ROOT,
    children: {},
    name: "Local storage"
};

const defaultDistStorage: FileSystemDirectory = {
    storeId: FILE_SYSTEM_TYPE_DIST,
    type: ITEM_MODE_ROOT,
    children: {},
    name: "dist"
};


export const initLocalStorageRoot = async (fileSystemDAO: FileSystemDAO) => {
    const storedItem = await fileSystemDAO.getFileSystemHierarchyRoot(FILE_SYSTEM_TYPE_LOCAL);
    const localStorageRoot = storedItem || defaultLocalStorage;
    return new LocalStorageFileSystem(fileSystemDAO, localStorageRoot, FILE_SYSTEM_TYPE_LOCAL);
};

export const initDistStorageRoot = async (fileSystemDAO: FileSystemDAO) => {
    const storedItem = await fileSystemDAO.getFileSystemHierarchyRoot(FILE_SYSTEM_TYPE_DIST);
    const distRoot = storedItem || defaultDistStorage;
    return new LocalStorageFileSystem(fileSystemDAO, distRoot, FILE_SYSTEM_TYPE_DIST);
};


export const initLocalStorages = async () => {
    return [await initDistStorageRoot(fileSystemLocalForageDAO), await initLocalStorageRoot(fileSystemLocalForageDAO)];
};