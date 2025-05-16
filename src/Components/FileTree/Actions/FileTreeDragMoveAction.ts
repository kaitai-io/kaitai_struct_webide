import {FileSystemPath} from "../FileSystemsTypes";
import {useFileSystems} from "../Store/FileSystemsStore";
import {updateCurrentlyLoadedFilesIfNeeded} from "./FileTreeRenameAction";
import {TreeNodeDisplay} from "../FileSystemVisitors/FileSystemFileTreeMapper";
import {FILE_SYSTEM_TYPE_KAITAI} from "../FileSystems/KaitaiFileSystem";

export class FileTreeDragMoveActionHelper {
    public static validateDropTarget = (item: TreeNodeDisplay, oldPath: FileSystemPath, newPath: FileSystemPath): boolean => {
        if (item.storeId === FILE_SYSTEM_TYPE_KAITAI) return false;
        if (oldPath.isTheSame(newPath)) {
            return false;
        }
        if (oldPath.isNestedIn(newPath)) {
            return false;
        }
        return true;
    };

    public static prepareOldAndNewPaths = (event: DragEvent, item: TreeNodeDisplay) => {
        const droppedElementPathIdentifier = event.dataTransfer.getData("draggedFileTreeItem");
        const oldPath = FileSystemPath.fromFullPathWithStore(droppedElementPathIdentifier);
        const newPath = FileSystemPath.fromFullPathWithStore(item.fullPathWithStore);
        return [oldPath, newPath];
    };
}

export const FileTreeDragMoveAction = async (oldPath: FileSystemPath, newPath: FileSystemPath) => {
    const fileSystemsStore = useFileSystems();
    const newPathCopy = newPath.clone();
    newPathCopy.append(oldPath.getLastPathElement());
    await fileSystemsStore.move(oldPath, newPathCopy);
    updateCurrentlyLoadedFilesIfNeeded(oldPath, newPathCopy);
    fileSystemsStore.selectPath(newPathCopy);
};