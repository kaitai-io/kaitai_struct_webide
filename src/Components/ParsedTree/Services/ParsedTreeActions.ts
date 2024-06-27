import {IExportedValue} from "../../../entities";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {RangeHelper} from "../../../v1/utils/RangeHelper";

export const PARSED_TREE_SOURCE = "SOURCE_PARSED_TREE";

export const TreeNodeSelectedAction = (exported: IExportedValue) => {
    const range = RangeHelper.getSimpleRange(exported);
    const currentFileStore = useCurrentBinaryFileStore();
    currentFileStore.updateSelectionRange(range.start, range.end, PARSED_TREE_SOURCE);
};