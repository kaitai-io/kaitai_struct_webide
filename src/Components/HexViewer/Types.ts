import {SimpleRange} from "../../v1/utils/RangeHelper";
import {IExportedValue} from "../../entities";

export enum OddStatus {
    NONE,
    ODD,
    EVEN
}

export enum RangePlacementStatus {
    NONE,
    START_OF_RANGE,
    MIDDLE,
    END_OF_RANGE,
    FULL_RANGE
}

export interface IExportedValueOddRange extends SimpleRange {
    isOdd: boolean;
    value: IExportedValue;
}

export interface ProcessedLetter {
    hex: string;
    char: string;
    index: number;
    oddStatus: OddStatus;
    rangePlacement: RangePlacementStatus;
    range?: IExportedValueOddRange;
}

export interface IExportedValueRangesForRow {
    rowAddress: number;
    data: IExportedValueOddRange[];
}

export interface ProcessLettersConfig {
    rowStartingIndex: number;
    emojiMode?: boolean;
    oddEvenRanges?: IExportedValueOddRange[];
    root: IExportedValue;
}