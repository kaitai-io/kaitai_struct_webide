import {FileSystemPath} from "../FileSystemsTypes";
import {useFileSystems} from "../Store/FileSystemsStore";
import {updateCurrentlyLoadedFilesIfNeeded} from "./FileTreeRenameAction";
import {TreeNodeDisplay, TreeNodeDisplayType} from "../FileSystemVisitors/FileSystemFileTreeMapper";
import {FILE_SYSTEM_TYPE_KAITAI} from "../FileSystems/KaitaiFileSystem";

export class FileTreeDragMoveActionHelper {
    public static validateDropTarget = (item: TreeNodeDisplay, oldPath: FileSystemPath, newPath: FileSystemPath): boolean => {
        if (item.storeId === FILE_SYSTEM_TYPE_KAITAI) return;
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
        const isNodeFile = [TreeNodeDisplayType.BINARY_FILE, TreeNodeDisplayType.KSY_FILE].indexOf(item.type) !== -1;
        let newPath;
        if (isNodeFile) {
            const pathParts = item.fullPath.split("/");
            pathParts.pop();
            newPath = FileSystemPath.of(item.storeId, pathParts.join("/"));
        } else {
            newPath = FileSystemPath.fromFullPathWithStore(item.fullPathWithStore);
        }

        return [oldPath, newPath];
    };
}

export const FileTreeDragMoveAction = async (oldPath: FileSystemPath, newPath: FileSystemPath) => {
    const lastDroppedPathElement = oldPath.getLastPathElement();
    const fileSystemsStore = useFileSystems();
    const filesToMoveFromDirectory = await fileSystemsStore.listAllItemsInPath(oldPath);
    const oldPathIsFileOrEmptyDirectory = filesToMoveFromDirectory.length === 0;
    try {
        if (oldPathIsFileOrEmptyDirectory) {
            const newPathCopy = newPath.clone();
            newPathCopy.append(lastDroppedPathElement);
            await fileSystemsStore.move(oldPath, newPathCopy);
            updateCurrentlyLoadedFilesIfNeeded(oldPath, newPathCopy);
            fileSystemsStore.selectPath(newPathCopy);
        } else {
            for (const fileRelativePath of filesToMoveFromDirectory) {
                const oldPathCopy = oldPath.clone();
                oldPathCopy.append(fileRelativePath);

                const newPathCopy = newPath.clone();
                newPathCopy.append(lastDroppedPathElement);
                newPathCopy.append(fileRelativePath);

                await fileSystemsStore.move(oldPathCopy, newPathCopy);
                updateCurrentlyLoadedFilesIfNeeded(oldPathCopy, newPathCopy);
            }
            fileSystemsStore.selectPath(newPath);
        }
        fileSystemsStore.openPath(newPath);
        fileSystemsStore.deletePath(oldPath);
    } catch (exception) {
        console.log(exception);
    }
};