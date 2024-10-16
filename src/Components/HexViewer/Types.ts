import {IExportedValue} from "../../DataManipulation/ExportedValueTypes";


export interface ProcessedLetter {
    hex: string;
    char: string;
    letterAddress: number;
    matchingRangeIndex: number;
    matchingRange?: IExportedValue;
}


export interface ProcessLettersConfig {
    rowAddress: number;
    emojiMode?: boolean;
    leafs: IExportedValue[];
    root: IExportedValue;
}