import {IExportedValue} from "../../../entities";
import {UpdateSelectionEvent, useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {RangeHelper, SimpleRange} from "../../../v1/utils/RangeHelper";

export const PARSED_TREE_SOURCE = "PARSED_TREE";

const NO_SELECTION_RANGE: SimpleRange = {
    start: -1,
    end: -1
};

export const TreeNodeSelectedAction = (exported: IExportedValue) => {
    const nodeRange = RangeHelper.getSimpleRange(exported);
    const rangeHasNoLength = nodeRange.start > nodeRange.end;
    const rangeToUse: SimpleRange = rangeHasNoLength
        ?  {...NO_SELECTION_RANGE}
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