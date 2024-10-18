import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {useAppStore} from "../Stores/AppStore";

const sanitizePath = (path: string) => {
    const pathIsRoot = path.length === 0;
    return pathIsRoot
        ? []
        : path.split("/");
};

const prepareTemplate = (fileNameWithoutExtension: string) => {
    return `meta:\n  id: ${fileNameWithoutExtension}\n  file-extension: ${fileNameWithoutExtension}\n`;
};


export const createNewKsyAction = async (storeId: string, path: string, fileName: string) => {
    const store = useFileSystems();
    const pathParts = sanitizePath(path);
    const fileNameWithoutExtension = fileName.replace(/\..*$/mi, "");
    pathParts.push(`${fileNameWithoutExtension}.ksy`);
    const newFilePath = pathParts.join("/");

    await store.addFile(storeId, newFilePath, prepareTemplate(fileNameWithoutExtension));
    store.selectPath(`${storeId}:${newFilePath}`);
    store.openPath(`${storeId}:${path}`);

    const appStore = useAppStore();
    appStore.updateSelectedKsyFile({
        storeId: storeId,
        filePath: newFilePath
    });

};