import {SimpleRange} from "../../v1/utils/RangeHelper";

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
}

export interface ProcessedLetter {
    isSelected: boolean;
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
    selection: SimpleRange;
    rowIndex: number;
    emojiMode?: boolean;
    oddEvenRanges?: IExportedValueOddRange[];
}