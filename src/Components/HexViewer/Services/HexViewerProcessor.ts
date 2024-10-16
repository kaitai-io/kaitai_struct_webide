import {convertByteToAsciiCharacter, convertByteToEmoji} from "./Convert";
import {ProcessedLetter, ProcessLettersConfig} from "../Types";
import {ExportedValueUtils} from "../../../Utils/ExportedValueUtils";

const mapByteToHexOrEmoji = (byteValue: number, emojiMode: boolean): string => {
    return emojiMode
        ? convertByteToEmoji(byteValue)
        : byteValue.toString(16).padStart(2, "0");
};

const processSingleByte = (byte: number, index: number, options: ProcessLettersConfig): ProcessedLetter => {
    const {rowAddress, leafs, emojiMode} = options;

    const letterAddress = rowAddress + index;
    const matchingRangeIndex = ExportedValueUtils.findLeafIndexUsingBinarySearch(letterAddress, leafs);

    return {
        letterAddress: letterAddress,
        hex: mapByteToHexOrEmoji(byte, emojiMode),
        char: convertByteToAsciiCharacter(byte),
        matchingRangeIndex: matchingRangeIndex,
        matchingRange: leafs[matchingRangeIndex],
    };
};

export const processContent = (content: Uint8Array, options: ProcessLettersConfig): ProcessedLetter[] => {
    return [...content].map((byteValue, index) => processSingleByte(byteValue, index, options));
};
export const createEmptyLettersToFillRow = (rowLettersCount: number, rowSize: number = 16): ProcessedLetter[] => {
    const emptyLettersCount = rowSize - rowLettersCount;
    return Array.from(new Array(emptyLettersCount)).map((_, index): ProcessedLetter => {
        return {
            letterAddress: rowLettersCount + index,
            hex: "",
            char: "",
            matchingRangeIndex: -1,
            matchingRange: undefined,
        };
    });
};