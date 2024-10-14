import {ProcessedLetter} from "../Types";
import {UpdateSelectionEvent, useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {HEX_VIEWER_SOURCE} from "./HexViewerActions";
import {RangeHelper, SimpleRange} from "../../../v1/utils/RangeHelper";

const LEFT_MOUSE_BUTTON = 1;

const handleDeselectAction = (e: MouseEvent, letter: ProcessedLetter) => {
    const store = useCurrentBinaryFileStore();

    const selectionRange: SimpleRange = {start: store.selectionStart, end: store.selectionEnd};
    const clickedLetterInSelectionRange = RangeHelper.containsPoint(selectionRange, letter.letterAddress);
    if (store.selectionStart === store.selectionEnd && clickedLetterInSelectionRange) {
        store.deselect();
        return true;
    }
};

const handleShiftSelectAction = (e: MouseEvent, letter: ProcessedLetter) => {
    const store = useCurrentBinaryFileStore();
    if (e.shiftKey && store.selectionPivot !== -1) {
        const event: UpdateSelectionEvent = {
            startNew: store.selectionPivot,
            endNew: letter.letterAddress,
            source: HEX_VIEWER_SOURCE,
            range: letter.matchingRange,
            pivot: store.selectionPivot
        };
        store.updateSelectionEvent(event);
        return true;
    }
};

const handleSingleSelectionAction = (e: MouseEvent, letter: ProcessedLetter) => {
    const store = useCurrentBinaryFileStore();
    const event: UpdateSelectionEvent = {
        startNew: letter.letterAddress,
        endNew: letter.letterAddress,
        range: letter.matchingRange,
        source: HEX_VIEWER_SOURCE,
        pivot: letter.letterAddress
    };
    store.updateSelectionEvent(event);
    return true;
};

const handleRangeSelectionAction = (e: MouseEvent, letter: ProcessedLetter) => {
    if (letter.matchingRange) {
        const store = useCurrentBinaryFileStore();
        const simpleRange = RangeHelper.getSimpleRange(letter.matchingRange);
        const start = letter.matchingRange.start;
        const event: UpdateSelectionEvent = {
            startNew: simpleRange.start,
            endNew: simpleRange.end,
            range: letter.matchingRange,
            source: HEX_VIEWER_SOURCE
        };
        store.updateSelectionEvent(event);
        store.updateSelectionPivot(start, HEX_VIEWER_SOURCE);
        return true;
    }
};

const handleDragSelectionStartAction = (e: MouseEvent, letter: ProcessedLetter) => {
    e.preventDefault();
    const store = useHexViewerConfigStore();
    const binStore = useCurrentBinaryFileStore();
    store.updateSelectionDragStart(letter);
    binStore.updateSelectionEvent({
        startNew: letter.letterAddress,
        endNew: letter.letterAddress,
        pivot: letter.letterAddress,
        source: HEX_VIEWER_SOURCE
    });
    return true;
};

const handleDragSelectionUpdate = (e: MouseEvent, letter: ProcessedLetter) => {
    const binaryFileStore = useCurrentBinaryFileStore();
    const hexViewerConfigStore = useHexViewerConfigStore();
    const isDragging = !!hexViewerConfigStore.selectionDragStart;
    const isLeftButtonDown = e.buttons === LEFT_MOUSE_BUTTON;
    if (!isDragging) return false;
    if (!isLeftButtonDown) {
        hexViewerConfigStore.updateSelectionDragStart(null);
        return false;
    }

    const start = hexViewerConfigStore.selectionDragStart.letterAddress;
    const end = letter.letterAddress;
    const event: UpdateSelectionEvent = {
        startNew: start,
        endNew: end,
        source: HEX_VIEWER_SOURCE
    };
    binaryFileStore.updateSelectionEvent(event);
    return true;
};

const handleSelectionDragEnd = () => {
    const hexViewerConfigStore = useHexViewerConfigStore();
    const currentBinaryFileStore = useCurrentBinaryFileStore();

    const isDragging = !!hexViewerConfigStore.selectionDragStart;
    if (!isDragging) return false;

    const dragStartIndex = hexViewerConfigStore.selectionDragStart.letterAddress;

    const newPivotIsSelectionStart = dragStartIndex !== currentBinaryFileStore.selectionStart;
    const newPivot = newPivotIsSelectionStart
        ? currentBinaryFileStore.selectionStart
        : currentBinaryFileStore.selectionEnd;

    hexViewerConfigStore.updateSelectionDragStart(null);
    currentBinaryFileStore.updateSelectionPivot(newPivot, HEX_VIEWER_SOURCE);
    return true;
};


export const onSingleClickAction = (e: MouseEvent, letter: ProcessedLetter) => {
    return handleDeselectAction(e, letter)
        || handleShiftSelectAction(e, letter)
        || handleSingleSelectionAction(e, letter);
};

export const onDoubleClickAction = (e: MouseEvent, letter: ProcessedLetter) => {
    return handleRangeSelectionAction(e, letter);
};

export const onDragStartAction = (e: MouseEvent, letter: ProcessedLetter) => {
    return handleDragSelectionStartAction(e, letter);
};

export const onMouseEnterAction = (e: MouseEvent, letter: ProcessedLetter) => {
    if (handleDragSelectionUpdate(e, letter)) return;
};

export const onMouseUpAction = (e: MouseEvent) => {
    return handleSelectionDragEnd();
};

