import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {useAppStore} from "../../../Stores/AppStore";
import {ArrayUtils} from "../../../Utils/ArrayUtils";
import {FileActionsWrapper} from "../../../Utils/Files/FileActionsWrapper";

export const downloadBinaryDataFromSelection = () => {
    const store = useCurrentBinaryFileStore();
    const appStore = useAppStore();

    const start = store.selectionStart;
    const end = store.selectionEnd;
    const fileDataLength = end - start + 1;
    const noContentToDownload = start === -1 || end === -1;
    if (noContentToDownload) return;

    const filePath = appStore.selectedBinaryInfo.filePath;
    const fileName = ArrayUtils.last(filePath.split("/"));
    const hexRange = `0x${start.toString(16)}-0x${end.toString(16)}`;
    const downloadedFileName = `${fileName}_${hexRange}.bin`;

    FileActionsWrapper.downloadFile(new Uint8Array(store.fileContent, start, fileDataLength), downloadedFileName);
};