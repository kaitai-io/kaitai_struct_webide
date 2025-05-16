import {FileSystemPath} from "../FileSystemsTypes";
import {useFileSystems} from "../Store/FileSystemsStore";
import {useAppStore} from "../../../Stores/AppStore";

export const updateCurrentlyLoadedFilesIfNeeded = (currentPath: FileSystemPath, newPath: FileSystemPath) => {
    const fileSystemAppStore = useAppStore();
    if (fileSystemAppStore.selectedKsyInfo.isPartOf(currentPath)) {
        const newCurrentlyLoadedFilePath = fileSystemAppStore.selectedKsyInfo.replacePathPart(currentPath, newPath);
        fileSystemAppStore.updateSelectedKsyFile(newCurrentlyLoadedFilePath);
    }

    if (fileSystemAppStore.selectedBinaryInfo.isPartOf(currentPath)) {
        const newCurrentlyLoadedFilePath = fileSystemAppStore.selectedBinaryInfo.replacePathPart(currentPath, newPath);
        fileSystemAppStore.updateSelectedKsyFile(newCurrentlyLoadedFilePath);
    }
};

export const FileTreeRenameAction = async (oldPath: FileSystemPath, newPath: FileSystemPath) => {
    const fileSystemsStore = useFileSystems();
    await fileSystemsStore.move(oldPath, newPath);
    updateCurrentlyLoadedFilesIfNeeded(oldPath, newPath);
    fileSystemsStore.selectPath(newPath);
};