import {ProcessedLetter} from "../Types";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {HEX_VIEWER_SOURCE} from "./HexViewerActions";

const LEFT_MOUSE_BUTTON = 1;
export const SingleByteClickAction = (e: MouseEvent, letter: ProcessedLetter) => {
    const store = useCurrentBinaryFileStore();
    if (letter.isSelected && store.selectionStart === store.selectionEnd) {
        store.deselect();
        return;
    }
    if (e.shiftKey && store.selectionPivot !== -1) {
        store.updateSelectionRange(store.selectionPivot, letter.index, HEX_VIEWER_SOURCE);
    } else {
        store.updateSelectionPoint(letter.index, HEX_VIEWER_SOURCE);
    }
};

export const StartDragSelection = (e: MouseEvent, letter: ProcessedLetter) => {
    const store = useHexViewerConfigStore();

    const uglySafeGuardForShiftClickSelectionChangingPivotPoint = e.shiftKey;
    if (uglySafeGuardForShiftClickSelectionChangingPivotPoint) return;
    store.updateSelectionDragStart(letter);
};

export const DragSelectionMoveEvent = (e: MouseEvent, letter: ProcessedLetter) => {
    const binaryFileStore = useCurrentBinaryFileStore();
    const hexViewerConfigStore = useHexViewerConfigStore();
    const isDragging = !!hexViewerConfigStore.selectionDragStart;
    const isLeftButtonDown = e.buttons === LEFT_MOUSE_BUTTON;

    if (!isDragging) return;
    if (!isLeftButtonDown) {
        hexViewerConfigStore.updateSelectionDragStart(null);
        return;
    }

    const start = hexViewerConfigStore.selectionDragStart.index;
    const end = letter.index;
    binaryFileStore.updateSelectionRange(start, end, HEX_VIEWER_SOURCE);
};

export const EndDragSelection = (e: MouseEvent) => {
    const hexViewerConfigStore = useHexViewerConfigStore();
    const currentBinaryFileStore = useCurrentBinaryFileStore();

    const isDragging = !!hexViewerConfigStore.selectionDragStart;
    const uglySafeGuardForShiftClickSelectionChangingPivotPoint = e.shiftKey;
    if (uglySafeGuardForShiftClickSelectionChangingPivotPoint) return;
    if (!isDragging) return;

    const dragStartIndex = hexViewerConfigStore.selectionDragStart.index;

    const newPivotIsSelectionStart = dragStartIndex !== currentBinaryFileStore.selectionStart;
    const newPivot = newPivotIsSelectionStart
        ? currentBinaryFileStore.selectionStart
        : currentBinaryFileStore.selectionEnd;

    hexViewerConfigStore.updateSelectionDragStart(null);
    currentBinaryFileStore.updateSelectionPivot(newPivot, HEX_VIEWER_SOURCE);
};

export const SelectRangeToWhichByteBelongs = (e: MouseEvent, letter: ProcessedLetter) => {
    if (!letter.range) return;

    const store = useCurrentBinaryFileStore();
    const start = letter.range.startIndex;
    const end = letter.range.endIndex;
    store.updateSelectionRange(start, end, HEX_VIEWER_SOURCE);
    store.updateSelectionPivot(start, HEX_VIEWER_SOURCE);
};