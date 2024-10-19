import {codeExecutionWorkerApi} from "../DataManipulation/ParsingModule/ParseWorkerApi";
import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {CurrentGoldenLayout} from "../Components/GoldenLayout/GoldenLayoutUI";
import {FileSystemPath} from "../Components/FileTree/FileSystemsTypes";

export const loadBinaryFileAction = async (binaryFileLocation: FileSystemPath) => {
    const store = useCurrentBinaryFileStore();
    const fileContent = await useFileSystems().getFile(binaryFileLocation.storeId, binaryFileLocation.path) as ArrayBuffer;
    CurrentGoldenLayout.updateHexViewerTitle(binaryFileLocation.path);
    store.newBinaryFileSelected(binaryFileLocation.path, fileContent, "SOURCE_REPARSE");
    codeExecutionWorkerApi.setInputAction(fileContent);
};