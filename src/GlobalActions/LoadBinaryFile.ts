import {useCurrentBinaryFileStore} from "../Stores/CurrentBinaryFileStore";
import {useFileSystems} from "../Components/FileTree/Store/FileSystemsStore";
import {FileSystemPath} from "../Components/FileTree/FileSystemsTypes";
import {useDockviewStore} from "../Components/Dockview/Store/DockviewStore";
import {GL_HEX_VIEWER_ID} from "../Components/Dockview/DockviewerConfig";
import {KaitaiCodeWorkerApi} from "../DataManipulation/ParsingModule/KaitaiCodeWorkerApi";

export const loadBinaryFileAction = async (binaryFileLocation: FileSystemPath) => {
    const fileContent = await useFileSystems().getFile(binaryFileLocation.storeId, binaryFileLocation.path) as ArrayBuffer;
    useDockviewStore().setTitle(GL_HEX_VIEWER_ID, binaryFileLocation.path);

    const store = useCurrentBinaryFileStore();
    store.newBinaryFileSelected(binaryFileLocation.path, fileContent, "SOURCE_REPARSE");
    KaitaiCodeWorkerApi.setInputAction(fileContent);
};