
import {convertByteToAsciiCharacter, convertByteToEmoji} from "./Convert";
import {IExportedValueRange, OddStatus, ProcessedLetter, ProcessLettersConfig, RangePlacementStatus} from "../Types";

const mapLetterToHexOrEmoji = (letter: number, emojiMode: boolean): string => {
    return emojiMode
        ? convertByteToEmoji(letter)
        : letter.toString(16).padStart(2, "0");
};


const fetchLetterOddEvenStatus = (matchingRange?: IExportedValueRange): OddStatus => {
    if (!matchingRange) return OddStatus.NONE;
    return matchingRange.isOdd
        ? OddStatus.ODD
        : OddStatus.EVEN;

};

const fetchLetterPlacementStatus = (letterIndex: number, matchingRange?: IExportedValueRange): RangePlacementStatus => {
    if (!matchingRange) return RangePlacementStatus.NONE;
    const isLeft = matchingRange.startIndex === letterIndex;
    const isRight = matchingRange.endIndex === letterIndex;
    if (isLeft && isRight) {
        return RangePlacementStatus.FULL_RANGE;
    } else if (isLeft) {
        return RangePlacementStatus.START_OF_RANGE;
    } else if (isRight) {
        return RangePlacementStatus.END_OF_RANGE;
    } else {
        return RangePlacementStatus.MIDDLE;
    }
};

const createSingleLetter = (letter: number, index: number, options: ProcessLettersConfig) => {
    const {selectionStart, selectionEnd, rowIndex, oddEvenRanges, emojiMode} = options;

    const letterIndex = index + rowIndex;
    const isSelected = letterIndex >= selectionStart && letterIndex <= selectionEnd;
    const matchingRange = (oddEvenRanges || []).find(flat => flat.startIndex <= letterIndex && flat.endIndex >= letterIndex);

    return {
        index: letterIndex,
        isSelected: isSelected,
        hex: mapLetterToHexOrEmoji(letter, emojiMode),
        char: convertByteToAsciiCharacter(letter),
        oddStatus: fetchLetterOddEvenStatus(matchingRange),
        rangePlacement: fetchLetterPlacementStatus(letterIndex, matchingRange)
    };
};

export const createLetters = (content: Uint8Array, options: ProcessLettersConfig): ProcessedLetter[] => {
    return [...content].map((letter, index) => createSingleLetter(letter, index, options));
};
export const createEmptyLettersToFillRow = (rowLettersCount: number, rowSize: number = 16): ProcessedLetter[] => {
    const emptyLettersCount = rowSize - rowLettersCount;
    return Array.from(new Array(emptyLettersCount)).map((_, index): ProcessedLetter => {
        return {
            index: rowLettersCount + index,
            isSelected: false,
            hex: "",
            char: "",
            oddStatus: OddStatus.NONE,
            rangePlacement: RangePlacementStatus.NONE,
        };
    });
};