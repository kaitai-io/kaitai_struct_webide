import {AbstractExportedValueMapper} from "./AbstractExportedValueMapper";
import {IExportedValue} from "../../../entities";
import {SimpleRange, RangeHelper} from "../RangeHelper";

export interface IExportedValueFlatInfo {
    leafs: IExportedValue[];
    emptyIntervals: SimpleRange[];
    byteArrays: SimpleRange[];
}

export class IExportedValueFlatInfoMapper extends AbstractExportedValueMapper<void> {

    private leafs: IExportedValue[] = [];
    private emptyIntervals: SimpleRange[];
    private arrayIntervals: SimpleRange[];
    private lastItemEndIndex = -1;

    public map(value: IExportedValue): IExportedValueFlatInfo {
        this.leafs = [];
        this.emptyIntervals = [];
        this.arrayIntervals = [];
        this.lastItemEndIndex = -1;

        super.map(value);

        return {
            leafs: [...this.leafs],
            byteArrays: [...this.arrayIntervals],
            emptyIntervals: [...this.emptyIntervals]
        };
    }

    protected visitObject(value: IExportedValue): void {
        Object.keys(value.object.fields || {}).forEach(key => {
            super.map(value.object.fields[key]);
        });
    }

    protected visitArray(value: IExportedValue): void {
        ([...value.arrayItems] || []).forEach((item) => super.map(item));
    }


    protected visitPrimitive(value: IExportedValue): void {
        this.leafs.push(value);
        this.determineEmptyInterval(value);
    }

    protected visitTypedArray(value: IExportedValue): void {
        this.leafs.push(value);
        this.determineEmptyInterval(value);
        this.determineByteArrayInterval(value);
    }

    protected visitEnum(value: IExportedValue): void {
        this.leafs.push(value);
        this.determineEmptyInterval(value);
    }

    private determineEmptyInterval(value: IExportedValue): void {
        const expectedPreviousItemEndIndex = RangeHelper.getStartIndex(value) - 1;
        if (expectedPreviousItemEndIndex !== this.lastItemEndIndex) {
            this.emptyIntervals.push(this.intervalFromLastIndex(expectedPreviousItemEndIndex));
        }
        this.lastItemEndIndex = RangeHelper.getEndIndex(value);
    }

    private determineByteArrayInterval(value: IExportedValue): void {
        if (value.bytes.length <= 64) return;

        this.arrayIntervals.push(RangeHelper.getSimpleRange(value));
    }

    private intervalFromLastIndex(expectedPreviousItemEndIndex: number): SimpleRange {
        return {
            start: this.lastItemEndIndex + 1,
            end: expectedPreviousItemEndIndex,
        };
    }

}