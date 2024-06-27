import {IExportedValue} from "../../../entities";
import {IExportedValueOddRange, IExportedValueRangesForRow} from "../Types";
import {RangeHelper, SimpleRange} from "../../../v1/utils/RangeHelper";

const prepareGroupForRow = (rowIndex: number, ranges: IExportedValueOddRange[], rowSize: number = 16) => {
    const rowStartIndex = rowSize * rowIndex;
    const rowEndIndex = rowStartIndex + rowSize - 1;
    const rowRange: SimpleRange = {
        start: rowSize * rowIndex,
        end: rowStartIndex + rowSize - 1
    };
    const currentRow: IExportedValueRangesForRow = {
        rowAddress: rowSize * rowIndex,
        data: []
    };

    for (const range of ranges) {
        const rangeStartsAfterRowEnd = rowEndIndex < range.start;
        if (rangeStartsAfterRowEnd) break;

        const rangesIntersect = RangeHelper.intervalIntersects(rowRange, range);
        if (rangesIntersect) {
            currentRow.data.push({...range});
        }
    }

    return currentRow;
};

const groupRangesToRows = (ranges: IExportedValueOddRange[], rowSize: number = 16): IExportedValueRangesForRow[] => {
    const endRangeIndex = ranges[ranges.length - 1].end;
    const maxBytesByLastRange = endRangeIndex + 1;
    const expectedNumberOfGroups = Math.ceil(maxBytesByLastRange / rowSize);

    return Array.from(Array(expectedNumberOfGroups).keys())
        .map(rowIndex => prepareGroupForRow(rowIndex, ranges, rowSize));

};

export const prepareOddEvenRangesForRows = (flatExported: IExportedValue[], rowSize: number = 16) => {
    if (!flatExported || flatExported.length === 0) return [];
    const ranges: IExportedValueOddRange[] = flatExported.map((item, index): IExportedValueOddRange => ({
        start: item.start + item.ioOffset,
        end: item.end + item.ioOffset - 1,
        isOdd: index % 2 !== 0,
    }));

    return groupRangesToRows(ranges, rowSize);
};
