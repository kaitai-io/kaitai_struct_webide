import {IFileProcessItem} from "../v1/utils/Files/Types";
import {FileActionsWrapper} from "../v1/utils/Files/FileActionsWrapper";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";


import {FILE_SYSTEM_TYPE_LOCAL} from "../v1/FileSystems/LocalStorageFileSystem";


const isKsyFile = (fileName: string) => {
    return fileName.toLowerCase().endsWith(".ksy");
};

const processKsyFile = async (file: IFileProcessItem) => {
    const fileStore = useFileSystems();

    const content = await file.read("text");
    return fileStore.addFile(FILE_SYSTEM_TYPE_LOCAL, file.file.name, content);
};

const processBinFile = async (file: IFileProcessItem) => {
    const fileStore = useFileSystems();

    const content = await file.read("arrayBuffer");
    return fileStore.addFile(FILE_SYSTEM_TYPE_LOCAL, file.file.name, content);
};
const processSingleUploadedFile = (file: IFileProcessItem) => {
    return isKsyFile(file.file.name)
        ? processKsyFile(file)
        : processBinFile(file);
};


export const processUploadedFileList = (fileList: FileList, source: string) => {
    const files = FileActionsWrapper.mapToProcessItems(fileList);
    console.log(`[UploadFiles][${source}] - uploading files: [${files.map(file => file.file.name)}]`);
    return Promise.all(files.map(processSingleUploadedFile));
};