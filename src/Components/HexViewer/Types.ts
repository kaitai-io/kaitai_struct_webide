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

export interface ProcessedLetter {
    isSelected: boolean;
    hex: string;
    char: string;
    index: number;
    oddStatus: OddStatus;
    rangePlacement: RangePlacementStatus;
}

export interface IExportedValueRange {
    startIndex: number;
    endIndex: number;
    isOdd: boolean;
}

export interface IExportedValueRangesForRow {
    rowAddress: number;
    data: IExportedValueRange[];
}

export interface ProcessLettersConfig {
    selectionStart: number;
    selectionEnd: number;
    rowIndex: number;
    emojiMode?: boolean;
    oddEvenRanges?: IExportedValueRange[];
}