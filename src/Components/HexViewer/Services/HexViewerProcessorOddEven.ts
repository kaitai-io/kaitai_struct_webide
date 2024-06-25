import {IExportedValue} from "../../../entities";
import {IExportedValueRange, IExportedValueRangesForRow} from "../Types";

enum TestRangeResult {
    OUT_OF_BOUNDS_BEFORE,
    OUT_OF_BOUNDS_AFTER,
    NON_MATCHING,
    MATCHING
}

const testRangeAgainstRow = (range: IExportedValueRange, rowStartIndex: number, rowEndIndex: number): TestRangeResult => {
    const rangeOutOfBoundsBefore = rowStartIndex > range.endIndex;
    if (rangeOutOfBoundsBefore) return TestRangeResult.OUT_OF_BOUNDS_BEFORE;

    const rangeOutOfBoundsOnTheEnd = rowEndIndex < range.startIndex;
    if (rangeOutOfBoundsOnTheEnd) return TestRangeResult.OUT_OF_BOUNDS_AFTER;

    const endIndexInRow = range.endIndex >= rowStartIndex && range.endIndex <= rowEndIndex;
    const startIndexInRow = range.startIndex >= rowStartIndex && range.startIndex <= rowEndIndex;
    const bothEndsInRow = range.startIndex <= rowStartIndex && rowEndIndex <= range.endIndex;

    return endIndexInRow || startIndexInRow || bothEndsInRow
        ? TestRangeResult.MATCHING
        : TestRangeResult.NON_MATCHING;
};

const prepareGroupForRow = (rowIndex: number, ranges: IExportedValueRange[], rowSize: number = 16) => {
    const rowStartIndex = rowSize * rowIndex;
    const rowEndIndex = rowStartIndex + rowSize - 1;
    const currentRow: IExportedValueRangesForRow = {
        rowAddress: rowSize * rowIndex,
        data: []
    };

    for (const range of ranges) {
        const testResult = testRangeAgainstRow(range, rowStartIndex, rowEndIndex);
        switch (testResult) {
            case TestRangeResult.NON_MATCHING:
            case TestRangeResult.OUT_OF_BOUNDS_BEFORE:
                continue;
            case TestRangeResult.OUT_OF_BOUNDS_AFTER:
                return currentRow;
            case TestRangeResult.MATCHING: {
                currentRow.data.push({...range});
            }
        }
    }
    return currentRow;
};

const groupRangesToRows = (ranges: IExportedValueRange[], rowSize: number = 16): IExportedValueRangesForRow[] => {
    const endRangeIndex = ranges[ranges.length - 1].endIndex;
    const maxBytesByLastRange = endRangeIndex + 1;
    const expectedNumberOfGroups = Math.ceil(maxBytesByLastRange / rowSize);

    return Array.from(Array(expectedNumberOfGroups).keys())
        .map(rowIndex => prepareGroupForRow(rowIndex, ranges, rowSize));

};

export const prepareOddEvenRangesForRows = (flatExported: IExportedValue[], rowSize: number = 16) => {
    if (!flatExported || flatExported.length === 0) return [];
    const ranges: IExportedValueRange[] = flatExported.map((item, index): IExportedValueRange => ({
        startIndex: item.start + item.ioOffset,
        endIndex: item.end + item.ioOffset - 1,
        isOdd: index % 2 !== 0,
        path: (item.path || []).join("/")
    }));

    return groupRangesToRows(ranges, rowSize);
};
