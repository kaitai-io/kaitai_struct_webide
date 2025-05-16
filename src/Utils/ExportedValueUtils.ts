import {IExportedValue} from "../DataManipulation/ExportedValueTypes";
import {RangeHelper, SimpleRange} from "./RangeHelper";

export class ExportedValueUtils {
    public static findLeafIndexUsingBinarySearch = (letterIndex: number, leafs: IExportedValue[]) => {
        let low = 0;
        let high = leafs.length - 1;
        let mid;
        let elementRange: SimpleRange;
        while (high >= low) {
            mid = low + Math.floor((high - low) / 2);
            elementRange = RangeHelper.getSimpleRange(leafs[mid]);

            if (RangeHelper.containsPoint(elementRange, letterIndex))
                return mid;

            if (elementRange.start > letterIndex)
                high = mid - 1;

            else
                low = mid + 1;
        }
        return -1;
    }
}