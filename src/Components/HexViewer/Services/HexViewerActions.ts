import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";

export const HEX_VIEWER_SOURCE = "SOURCE_HEX_VIEWER";

export const handleSelectionUpdatedEvents = (eventName: string, args: any[], scrollTo: (index: number) => void) => {
    const hexViewerConfigStore = useHexViewerConfigStore();
    const isSelectionEvent = ["updateSelectionRange", "updateSelectionPoint"].indexOf(eventName) !== -1;
    const sourceArgument = args.find(arg => typeof arg === "string" && arg.startsWith("SOURCE_"));
    if (!isSelectionEvent || sourceArgument === HEX_VIEWER_SOURCE) return;

    const rowIndexToGo = Math.floor(args[0] / hexViewerConfigStore.rowSize);
    scrollTo(rowIndexToGo);
};