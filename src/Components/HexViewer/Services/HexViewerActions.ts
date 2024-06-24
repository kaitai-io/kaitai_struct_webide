import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {ProcessedLetter} from "../Types";

const LEFT_MOUSE_BUTTON = 1;

export const SingleByteClickAction = (e: MouseEvent, letter: ProcessedLetter) => {
    const store = useCurrentBinaryFileStore();
    if(letter.isSelected && store.selectionStart !== store.selectionStart) {
        store.deselect();
        return;
    }
    if (e.shiftKey) {
        store.updateSelectionRange(store.selectionStart, letter.index);
    } else {
        store.updateSelectionPoint(letter.index);
    }
};

export const StartDragSelection = (e: MouseEvent, letter: ProcessedLetter) => {
    const store = useHexViewerConfigStore();
    store.updateSelectionDragStart(letter.index);
};

export const DragSelectionMoveEvent = (e: MouseEvent, letter: ProcessedLetter) => {
    const binaryFileStore = useCurrentBinaryFileStore();
    const hexViewerConfigStore = useHexViewerConfigStore();
    const isDragging = hexViewerConfigStore.selectionDragStart !== -1;
    const isLeftButtonDown = e.buttons === LEFT_MOUSE_BUTTON;

    if (!isDragging) return;
    if (!isLeftButtonDown) {
        hexViewerConfigStore.updateSelectionDragStart(-1);
        return;
    }

    binaryFileStore.updateSelectionRange(hexViewerConfigStore.selectionDragStart, letter.index);
};

export const EndDragSelection = (e: MouseEvent) => {
    const store = useHexViewerConfigStore();
    store.updateSelectionDragStart(-1);
};

export const SelectRangeToWhichByteBelongs = (e: MouseEvent, letter: ProcessedLetter) => {
    const store = useCurrentBinaryFileStore();
    const foundRange = store.parsedFileFlattened.find(range => {
        return range.start + range.ioOffset <= letter.index && letter.index <= range.end + range.ioOffset - 1;
    });

    if (foundRange) {
        store.updateSelectionRange(foundRange.start + foundRange.ioOffset, foundRange.end + foundRange.ioOffset - 1);
    }
};