import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {useAppStore} from "../Stores/AppStore";
import {FileActionsWrapper} from "../Utils/Files/FileActionsWrapper";
import {FileSystemPath} from "../Components/FileTree/FileSystemsTypes";

const sanitizePath = (path: string) => {
    const pathIsRoot = path.length === 0;
    return pathIsRoot
        ? []
        : path.split("/");
};

const prepareTemplate = async (fileNameWithoutExtension: string): Promise<string> => {
    const template = await FileActionsWrapper.fetchFileFromServer("template.ksy") as string;
    return template.replaceAll("{NAME}", fileNameWithoutExtension);
};


export const createNewKsyAction = async ({storeId, path}: FileSystemPath, fileName: string) => {
    const pathParts = sanitizePath(path);
    const fileNameWithoutExtension = fileName.replace(/\..*$/mi, "");
    pathParts.push(`${fileNameWithoutExtension}.ksy`);
    const newFilePath = pathParts.join("/");
    const template = await prepareTemplate(fileNameWithoutExtension);
    const fileSystemsStore = useFileSystems();
    await fileSystemsStore.addFile(storeId, newFilePath, template);
    fileSystemsStore.openPath(FileSystemPath.of(storeId, path));

    const appStore = useAppStore();
    const newFileSystemPath = FileSystemPath.of(storeId, newFilePath);
    fileSystemsStore.selectPath(newFileSystemPath);
    appStore.updateSelectedKsyFile(newFileSystemPath);


};