import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {CurrentBinaryFile, UpdateSelectionEvent} from "../../../Stores/CurrentBinaryFileStore";

export const HEX_VIEWER_SOURCE = "SOURCE_HEX_VIEWER";

const MAGIC_NUMBER_OF_ROWS_THAT_ARE_OUTSIDE_OF_VIEWPORT = 3;
const isInViewPort = (rowIndexToGo: number, viewportList: any) => {
    if (!viewportList || viewportList.length === 0) return;
    const viewPortFirstRow: number = viewportList[0].data;
    const viewPortLastRow: number = viewportList[viewportList.length - 1].data - MAGIC_NUMBER_OF_ROWS_THAT_ARE_OUTSIDE_OF_VIEWPORT;
    return rowIndexToGo < viewPortFirstRow || rowIndexToGo > viewPortLastRow;
};

export const handleSelectionUpdatedEvents = (eventName: string, args: any[], viewportList: any[], scrollTo: (index: number) => void) => {
    const hexViewerConfigStore = useHexViewerConfigStore();
    const isSelectionEvent = "updateSelectionEvent" === eventName;
    const event = args[0] as UpdateSelectionEvent;
    if (!isSelectionEvent || event.source === HEX_VIEWER_SOURCE) return false;

    const rowIndexToGo = Math.floor(event.startNew / hexViewerConfigStore.rowSize);
    if (isInViewPort(rowIndexToGo, viewportList)) {
        scrollTo(rowIndexToGo);
        return true;
    }
};


export const handleOnPageReloadScrollToSelection = (eventName: string, store: CurrentBinaryFile, args: any[], scrollTo: (index: number) => void) => {
    const hexViewerConfigStore = useHexViewerConfigStore();
    const isSelectionEvent = ["newBinaryFileSelected"].indexOf(eventName) !== -1;
    const sourceArgument = args.find(arg => typeof arg === "string" && arg.startsWith("SOURCE_"));


    if (!isSelectionEvent || sourceArgument === HEX_VIEWER_SOURCE) return false;
    if (store.selectionStart === -1) return;

    const rowIndexToGo = Math.floor(store.selectionStart / hexViewerConfigStore.rowSize);
    setTimeout(() => scrollTo(rowIndexToGo), 100);
    return true;
};