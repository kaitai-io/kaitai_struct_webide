import {IFileProcessItem} from "../v1/utils/Files/Types";
import {fileSystemsManager} from "../v1/FileSystems/FileSystemManager";

const isKsyFile = (fileName: string) => {
    return fileName.toLowerCase().endsWith(".ksy");
};

const processKsyFile = async (file: IFileProcessItem) => {
    const content = await file.read("text");
    return fileSystemsManager.local.put(file.file.name, content);
};

const processBinFile = async (file: IFileProcessItem) => {
    const content = await file.read("arrayBuffer");
    return fileSystemsManager.local.put(file.file.name, content);
};
const processFile = (file: IFileProcessItem) => {
    return isKsyFile(file.file.name)
        ? processKsyFile(file)
        : processBinFile(file);
};


export const processUploadedFiles = (files: IFileProcessItem[]) => {
    return Promise.all(files.map(processFile));
};