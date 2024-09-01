import {FileLocationInfo} from "../Stores/AppStore";
import {fileSystemsManager} from "../v1/FileSystems/FileSystemManager";
import {codeExecutionWorkerApi} from "../DataManipulation/ParsingModule/ParseWorkerApi";
import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";

export const loadBinaryFileAction = async (binaryFileLocation: FileLocationInfo) => {
    const store = useCurrentBinaryFileStore();
    const fileContent = await fileSystemsManager[binaryFileLocation.storeId].get(binaryFileLocation.filePath) as ArrayBuffer;
    store.newBinaryFileSelected(binaryFileLocation.filePath, fileContent, "SOURCE_REPARSE");
    codeExecutionWorkerApi.setInputAction(fileContent);
};