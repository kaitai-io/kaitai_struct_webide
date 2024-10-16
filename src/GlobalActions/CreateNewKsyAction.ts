import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {loadKsyFileAction} from "./LoadKsyFile";

export const createNewKsyAction = async (storeId: string, filePath: string) => {
    const store = useFileSystems();
    const pathParts = filePath.split("/");
    const fileName = pathParts[pathParts.length - 1];
    const fileNameWithoutExtension = fileName.replace(/\..*$/mi, "");
    pathParts[pathParts.length - 1] = `${fileNameWithoutExtension}.ksy`;
    const defaultKsyTemplate = `meta:\n  id: ${fileNameWithoutExtension}\n  file-extension: ${fileNameWithoutExtension}\n`;
    const newFilePath = pathParts.join("/");
    await store.addFile(storeId, newFilePath, defaultKsyTemplate);
    const newFilePathWithStore = `${storeId}:${newFilePath}`;
    store.selectPath(newFilePathWithStore);
    loadKsyFileAction({
        storeId: storeId,
        filePath: newFilePath
    });

};