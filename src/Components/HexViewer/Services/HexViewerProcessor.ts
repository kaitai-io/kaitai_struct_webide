import {convertByteToAsciiCharacter, convertByteToEmoji} from "./Convert";
import {IExportedValueOddRange, OddStatus, ProcessedLetter, ProcessLettersConfig, RangePlacementStatus} from "../Types";
import {RangeHelper} from "../../../v1/utils/RangeHelper";

const mapLetterToHexOrEmoji = (letter: number, emojiMode: boolean): string => {
    return emojiMode
        ? convertByteToEmoji(letter)
        : letter.toString(16).padStart(2, "0");
};


const fetchLetterOddEvenStatus = (matchingRange?: IExportedValueOddRange): OddStatus => {
    if (!matchingRange) return OddStatus.NONE;
    return matchingRange.isOdd
        ? OddStatus.ODD
        : OddStatus.EVEN;

};

const fetchLetterPlacementStatus = (letterIndex: number, matchingRange?: IExportedValueOddRange): RangePlacementStatus => {
    if (!matchingRange) return RangePlacementStatus.NONE;
    const matchOnTheLeft = matchingRange.start === letterIndex;
    const matchOnTheRight = matchingRange.end === letterIndex;
    if (matchOnTheLeft && matchOnTheRight) {
        return RangePlacementStatus.FULL_RANGE;
    } else if (matchOnTheLeft) {
        return RangePlacementStatus.START_OF_RANGE;
    } else if (matchOnTheRight) {
        return RangePlacementStatus.END_OF_RANGE;
    } else {
        return RangePlacementStatus.MIDDLE;
    }
};

const createSingleLetter = (letter: number, index: number, options: ProcessLettersConfig) => {
    const {selection, rowIndex, oddEvenRanges, emojiMode} = options;

    const letterIndex = index + rowIndex;
    const isSelected = RangeHelper.containsPoint(selection, letterIndex);
    const matchingRange = (oddEvenRanges || []).find(flat => RangeHelper.containsPoint(flat, letterIndex));

    return {
        index: letterIndex,
        isSelected: isSelected,
        hex: mapLetterToHexOrEmoji(letter, emojiMode),
        char: convertByteToAsciiCharacter(letter),
        range: matchingRange,
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
            range: null,
            oddStatus: OddStatus.NONE,
            rangePlacement: RangePlacementStatus.NONE,
        };
    });
};