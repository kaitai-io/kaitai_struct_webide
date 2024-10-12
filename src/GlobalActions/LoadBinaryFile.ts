import {FileLocationInfo} from "../Stores/AppStore";
import {codeExecutionWorkerApi} from "../DataManipulation/ParsingModule/ParseWorkerApi";
import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";

export const loadBinaryFileAction = async (binaryFileLocation: FileLocationInfo) => {
    const store = useCurrentBinaryFileStore();
    const fileContent = await useFileSystems().getFile(binaryFileLocation.storeId, binaryFileLocation.filePath) as ArrayBuffer;
    store.newBinaryFileSelected(binaryFileLocation.filePath, fileContent, "SOURCE_REPARSE");
    codeExecutionWorkerApi.setInputAction(fileContent);
};