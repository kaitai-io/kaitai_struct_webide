import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {useAppStore} from "../Stores/AppStore";
import {FileActionsWrapper} from "../Utils/Files/FileActionsWrapper";

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


export const createNewKsyAction = async (storeId: string, path: string, fileName: string) => {
    const store = useFileSystems();
    const pathParts = sanitizePath(path);
    const fileNameWithoutExtension = fileName.replace(/\..*$/mi, "");
    pathParts.push(`${fileNameWithoutExtension}.ksy`);
    const newFilePath = pathParts.join("/");
    const template= await prepareTemplate(fileNameWithoutExtension);
    await store.addFile(storeId, newFilePath, template);
    store.selectPath(`${storeId}:${newFilePath}`);
    store.openPath(`${storeId}:${path}`);

    const appStore = useAppStore();
    appStore.updateSelectedKsyFile({
        storeId: storeId,
        filePath: newFilePath
    });

};