import {FileSystemItem} from "../../../FileTree/FileSystemsTypes";
import {ArrayUtils} from "../../../../Utils/ArrayUtils";
import {FileSystemFilesCollectorV0} from "./FileSystemFilesCollectorV0";
import {fileSystemLocalForageDAO} from "../../../FileTree/Database/FileSystemLocalForageDAO";

interface FileSystemItemAtVersion0 {
    fsType: string;
    type: "file" | "folder";
    fn?: string;
    children?: { [key: string]: FileSystemItem; };
}


interface FileSystemFileV1 {
    storeId: string;
    type: "file";
    name: string;
}

interface FileSystemDirectoryV1 {
    storeId: string;
    type: "folder" | "root";
    name: string;
    children: { [key: string]: FileSystemFileV1 | FileSystemDirectoryV1; };
}


type FileSystemItemV1 = FileSystemFileV1 | FileSystemDirectoryV1;

interface StorageUpgradeConfig {
    rootFn: string;
    hierarchyRootKey: string;
    itemKey: string;
    storeId: string;
}


const upgradeLocalStorageItem = (fileSystemItem: FileSystemItemAtVersion0, parentKey: string, isRoot: boolean = false): FileSystemItemV1 => {
    switch (fileSystemItem.type) {
        case "folder": {
            const newChildren = {};
            Object.entries(fileSystemItem.children).forEach(([key, value]) => {
                newChildren[key] = upgradeLocalStorageItem(value as unknown as FileSystemItemAtVersion0, key);
            });
            return {
                storeId: fileSystemItem.fsType,
                type: isRoot ? "root" : "folder",
                name: fileSystemItem.fn || parentKey,
                children: newChildren
            };
        }
        case "file": {
            return {
                storeId: fileSystemItem.fsType,
                type: "file",
                name: fileSystemItem.fn || parentKey,
            };
        }
    }
};

const changeAllLocalStorageFilePathsToUnifiedKey = async (singleFileKey: string, localStorage: FileSystemItemV1, paths: string[]) => {
    for (const path of paths) {
        const pathParts = path.split("/");
        const fileName = ArrayUtils.last(pathParts);
        const oldFileKey = `${singleFileKey}[${fileName}]`;
        const fileContent = await fileSystemLocalForageDAO.getFile(oldFileKey);
        if (fileName === "'") {
            console.log(fileContent);

        }
        await fileSystemLocalForageDAO.saveFile(`${localStorage.storeId}:${path}`, fileContent);
        await fileSystemLocalForageDAO.deleteFile(oldFileKey);
    }
};

const upgradeSingleStorage = async (config: StorageUpgradeConfig) => {
    const storageFromLocalForage = await fileSystemLocalForageDAO
        .getFileSystemHierarchyRoot(config.hierarchyRootKey) as unknown as FileSystemItemAtVersion0;
    if (!!storageFromLocalForage) {
        const storage = upgradeLocalStorageItem(storageFromLocalForage, config.rootFn, true);
        const paths = FileSystemFilesCollectorV0.collectFileNames(storageFromLocalForage);
        await changeAllLocalStorageFilePathsToUnifiedKey(config.itemKey, storage as FileSystemDirectoryV1, paths);
        await fileSystemLocalForageDAO.saveFileSystemHierarchyRoot(config.storeId, storage as any);
        await fileSystemLocalForageDAO.deleteFile(config.hierarchyRootKey);
    }
};


export const UpgradeToV1 = async () => {
    const storagesConfig: StorageUpgradeConfig[] = [
        {
            rootFn: "Local storage",
            hierarchyRootKey: "fs_files",
            itemKey: "fs_file",
            storeId: "local",
        }, {
            rootFn: "dist",
            hierarchyRootKey: "fs_dist",
            itemKey: "fs_dist",
            storeId: "dist",
        }
    ];
    for (let storageUpgradeConfig of storagesConfig) {
        await upgradeSingleStorage(storageUpgradeConfig);
    }
};