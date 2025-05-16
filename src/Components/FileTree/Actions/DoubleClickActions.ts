import {FILE_SYSTEM_TYPE_DIST} from "../FileSystems/LocalStorageFileSystem";
import {TreeNodeDisplay, TreeNodeDisplayType} from "../FileSystemVisitors/FileSystemFileTreeMapper";
import {FileTreeCtxActionOpenDistFile} from "../ContextMenu/Actions/distStorage/FileTreeCtxActionOpenDistFile";
import {FileSystemPath} from "../FileSystemsTypes";
import {useAppStore} from "../../../Stores/AppStore";
import {useFileSystems} from "../Store/FileSystemsStore";

const DistFileSystemDoubleClickSpecificActions = (item: TreeNodeDisplay) => {
    switch (item.type) {
        case TreeNodeDisplayType.KSY_FILE: {
            FileTreeCtxActionOpenDistFile(item).onClick();
            return true;
        }
        case TreeNodeDisplayType.BINARY_FILE: {
            FileTreeCtxActionOpenDistFile(item).onClick();
            return true;
        }
    }
    return false;
};


const ContentStoreDoubleClickActions = (item: TreeNodeDisplay) => {
    const appStore = useAppStore();
    switch (item.type) {
        case TreeNodeDisplayType.KSY_FILE: {
            appStore.updateSelectedKsyFile(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
            return true;
        }
        case TreeNodeDisplayType.BINARY_FILE: {
            appStore.updateSelectedBinaryFile(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
            return true;
        }
    }
    return false;
};

const CommonDoubleClickActions = (item: TreeNodeDisplay) => {
    const fileSystemStore = useFileSystems();
    switch (item.type) {
        case TreeNodeDisplayType.EMPTY_FOLDER: {
            return true;
        }
        case TreeNodeDisplayType.OPEN_FOLDER: {
            fileSystemStore.closePath(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
            return true;
        }
        case TreeNodeDisplayType.CLOSED_FOLDER: {
            fileSystemStore.openPath(FileSystemPath.fromFullPathWithStore(item.fullPathWithStore));
            return true;
        }
    }
    return false;
};

export const DoubleClickActions = (item: TreeNodeDisplay) => {
    switch (item.storeId) {
        case FILE_SYSTEM_TYPE_DIST: {
            DistFileSystemDoubleClickSpecificActions(item) || CommonDoubleClickActions(item);
            return;
        }
        default: {
            ContentStoreDoubleClickActions(item) || CommonDoubleClickActions(item);
        }
    }
};