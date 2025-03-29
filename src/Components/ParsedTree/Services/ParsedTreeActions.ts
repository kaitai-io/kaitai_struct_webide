import {IExportedValue} from "../../../DataManipulation/ExportedValueTypes";
import {UpdateSelectionEvent, useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {RangeHelper, SimpleRange} from "../../../Utils/RangeHelper";
import {ExportedValueMappers} from "../../../DataManipulation/ExportedValueMappers";
import {useParsedTreeStore} from "../Store/ParsedTreeStore";

export const PARSED_TREE_SOURCE = "PARSED_TREE";

const NO_SELECTION_RANGE: SimpleRange = {
    start: -1,
    end: -1
};

const collectNestedPaths = (pathParts: string[]) => {
    let currentPath = "";
    return pathParts.map(pathPart => {
        if (currentPath.length !== 0) {
            currentPath += "/";
        }
        currentPath += pathPart;
        return currentPath;
    });
};

export const handleSelectionUpdatedEvents = (eventName: string, args: any[], scrollTo: (index: number) => void) => {
    const isSelectionEvent = "updateSelectionEvent" === eventName;
    const event = args[0] as UpdateSelectionEvent;
    if (!isSelectionEvent || event.source === PARSED_TREE_SOURCE || !event.range) return false;

    const binaryStore = useCurrentBinaryFileStore();
    const parsedTreeStore = useParsedTreeStore();
    const recursivePaths = collectNestedPaths(event.range.path);
    const newPaths = [...new Set([...parsedTreeStore.openPaths, ...recursivePaths])];
    parsedTreeStore.setOpenPaths(newPaths);
    const parsedTreeLeafs = ExportedValueMappers.collectParsedTreeLeafs(binaryStore.parsedFile, newPaths);
    const index = parsedTreeLeafs.findIndex(item => item.exportedValue.path.join("/") === event.range.path.join("/"));
    setTimeout(() => scrollTo(index), 50);
    return true
};


export const TreeNodeSelectedAction = (exported: IExportedValue) => {
    const nodeRange = RangeHelper.getSimpleRange(exported);
    const rangeHasNoLength = nodeRange.start > nodeRange.end;
    const rangeToUse: SimpleRange = rangeHasNoLength
        ? {...NO_SELECTION_RANGE}
        : nodeRange;
    const store = useCurrentBinaryFileStore();

    const event: UpdateSelectionEvent = {
        startNew: rangeToUse.start,
        endNew: rangeToUse.end,
        range: exported,
        source: PARSED_TREE_SOURCE
    };
    store.updateSelectionEvent(event);
};