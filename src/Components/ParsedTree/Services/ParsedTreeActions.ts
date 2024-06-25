import {IExportedValue} from "../../../entities";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";

export const PARSED_TREE_SOURCE = "PARSED_TREE";

export const TreeNodeSelected = (exported: IExportedValue) => {
    const start = exported.ioOffset + exported.start;
    const end = exported.ioOffset + exported.end - 1;
    const currentFileStore = useCurrentBinaryFileStore();
    currentFileStore.updateSelectionRange(start, end, PARSED_TREE_SOURCE);
};