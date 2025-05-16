import {IFileProcessItem} from "../Utils/Files/Types";
import {FileActionsWrapper} from "../Utils/Files/FileActionsWrapper";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";


import {FILE_SYSTEM_TYPE_LOCAL} from "../Components/FileTree/FileSystems/LocalStorageFileSystem";

interface FileToUpload {
    path: string;
    content: string | ArrayBuffer;
}

const isKsyFile = (fileName: string) => {
    return fileName.toLowerCase().endsWith(".ksy");
};

const preparePathFromDirectoryUpload = (file: IFileProcessItem) => {
    const filePath = file.file.webkitRelativePath.split("/");
    filePath.splice(0, 1);
    return filePath.join("/");
};

const prepareFileToBeUploaded = async (file: IFileProcessItem, isUploadingFolder: boolean) => {
    const isKsy = isKsyFile(file.file.name);
    return {
        path: isUploadingFolder ? preparePathFromDirectoryUpload(file) : file.file.name,
        content: isKsy ? await file.read("text") : await file.read("arrayBuffer")
    };
};


const uploadFile = async (file: FileToUpload) => {
    const fileStore = useFileSystems();
    return fileStore.addFile(FILE_SYSTEM_TYPE_LOCAL, file.path, file.content);
};

export const processUploadedFileList = async (fileList: FileList, isDirectoryUpload: boolean, source: string) => {
    const files = FileActionsWrapper.mapToProcessItems(fileList);
    const filesToUpload = await Promise.all(files.map((file) => prepareFileToBeUploaded(file, isDirectoryUpload)));
    console.log(`[UploadFiles][${source}] - uploading files: [${filesToUpload.map(file => file.path)}]`);
    return Promise.all(filesToUpload.map(uploadFile));
};