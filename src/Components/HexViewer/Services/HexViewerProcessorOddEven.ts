import {IExportedValue} from "../../../entities";
import {IExportedValueOddRange, IExportedValueRangesForRow} from "../Types";
import {RangeHelper, SimpleRange} from "../../../v1/utils/RangeHelper";

const groupRangesToRows = (ranges: IExportedValueOddRange[], rowSize: number = 16): IExportedValueRangesForRow[] => {
    const endRangeIndex = ranges[ranges.length - 1].end;
    const maxBytesByLastRange = endRangeIndex + 1;
    const expectedNumberOfGroups = Math.ceil(maxBytesByLastRange / rowSize);

    const groupedRows = Array.from(Array(expectedNumberOfGroups).keys())
        .map(rowIndex => ({
            rowAddress: rowSize * rowIndex,
            data: []
        }));

    for (const range of ranges) {
        const firstAffectedRowIndex = Math.floor(range.start / rowSize);
        const lastAffectedRowIndex = Math.floor(range.end / rowSize);
        for (let i = firstAffectedRowIndex; i <= lastAffectedRowIndex; ++i) {
            groupedRows[i].data.push(range);
        }
    }

    return groupedRows;

};

export const prepareOddEvenRangesForRows = (flatExported: IExportedValue[], rowSize: number = 16) => {
    if (!flatExported || flatExported.length === 0) return [];
    const ranges: IExportedValueOddRange[] = flatExported.map((item, index): IExportedValueOddRange => ({
        start: RangeHelper.getStartIndex(item),
        end: RangeHelper.getEndIndex(item),
        isOdd: index % 2 !== 0,
        value: item
    }));
    return groupRangesToRows(ranges, rowSize);
};
