import {IExportedValue} from "../../entities";

export interface SimpleRange {
    start: number;
    end: number;
}

export class RangeHelper {
    public static exportedContainsPoint = (exportedObject: IExportedValue, point: number) => {
        const range = RangeHelper.getSimpleRange(exportedObject);
        return RangeHelper.containsPoint(range, point);
    };

    public static containsPoint = (range: SimpleRange, point: number) => {
        return range.start <= point && point <= range.end;
    };


    public static intervalIntersects = (range1: SimpleRange, range2: SimpleRange) => {
        return Math.max(range1.start, range2.start) <= Math.min(range1.end, range2.end);
    };

    public static getSimpleRange = (value: IExportedValue): SimpleRange => {
        return {
            start: RangeHelper.getStartIndex(value),
            end: RangeHelper.getEndIndex(value)
        };
    };

    public static getStartIndex = (value: IExportedValue): number => {
        return value.start + value.ioOffset;
    };

    public static getEndIndex = (value: IExportedValue): number => {
        return value.end + value.ioOffset - 1;
    };
}
