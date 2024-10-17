import {ProcessedLetter, ProcessLettersConfig} from "../Types";
import {ExportedValueUtils} from "../../../Utils/ExportedValueUtils";

const mapByteToHexOrEmoji = (byte: number, emojiMode: boolean): string => {
    return emojiMode
        ? mapByteToEmoji(byte)
        : byte.toString(16).padStart(2, "0");
};

export const mapByteToEmoji = (byte: number) => {
    const baseEmojiCodePoint = 0x1F347;
    const emojiCodePoint = baseEmojiCodePoint + byte;

    return String.fromCodePoint(emojiCodePoint);
};

export const mapByteToAsciiCharacter = (byte: number) => {
    if (byte === 32) {
        return "\u00a0";
    }

    const isWhitespace = byte < 32 || (0x7f <= byte && byte <= 0xa0) || byte === 0xad;
    return isWhitespace ? "." : String.fromCharCode(byte);
};


const processSingleByte = (byte: number, index: number, options: ProcessLettersConfig): ProcessedLetter => {
    const {rowAddress, leafs, emojiMode} = options;

    const letterAddress = rowAddress + index;
    const matchingRangeIndex = ExportedValueUtils.findLeafIndexUsingBinarySearch(letterAddress, leafs);

    return {
        letterAddress: letterAddress,
        hex: mapByteToHexOrEmoji(byte, emojiMode),
        char: mapByteToAsciiCharacter(byte),
        matchingRangeIndex: matchingRangeIndex,
        matchingRange: leafs[matchingRangeIndex],
    };
};

export const processContent = (content: Uint8Array, options: ProcessLettersConfig): ProcessedLetter[] => {
    return [...content].map((byteValue, index) => processSingleByte(byteValue, index, options));
};
export const createEmptyLettersToFillRow = (rowLettersCount: number, rowSize: number = 16): ProcessedLetter[] => {
    const emptyLettersCount = rowSize - rowLettersCount;
    return Array.from(new Array(emptyLettersCount)).map((_): ProcessedLetter => {
        return {
            letterAddress: 0,
            hex: "",
            char: "",
            matchingRangeIndex: -1,
            matchingRange: undefined,
        };
    });
};