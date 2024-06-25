import {NumberUtils} from "../../../v1/utils/Misc/NumberUtils";
import {useCurrentBinaryFileStore} from "../../../Stores/CurrentBinaryFileStore";
import {useHexViewerConfigStore} from "../Store/HexViewerConfigStore";
import {HEX_VIEWER_SOURCE} from "./HexViewerActions";

const calculateMoveDiff = (e: KeyboardEvent, rowSize: number) => {
    switch (e.key) {
        case "ArrowDown":
            return rowSize;
        case "ArrowUp":
            return -rowSize;
        case "ArrowRight":
            return 1;
        case "ArrowLeft":
            return -1;
        case "PageUp":
            return -rowSize * 10;
        case "PageDown":
            return rowSize * 10;
    }
};

const calculateNewStartEnd = (start: number, end: number, pivot: number, moveDiff: number, fileLength: number, isSelectionMove: boolean) => {
    let newStart = start;
    let newEnd = end;
    if (isSelectionMove) {
        const isStartPivot = start === pivot;
        let modifiedEnd = isStartPivot ? end : start;
        modifiedEnd = NumberUtils.clamp(modifiedEnd + moveDiff, 0, fileLength);
        return [pivot, modifiedEnd];
    } else {
        newStart = newEnd = NumberUtils.clamp(newStart + moveDiff, 0, fileLength);
    }
    return [newStart, newEnd];
};
export const HandleCursorMoveAndSelect = (e: KeyboardEvent) => {
    if(e.key === "Tab") {
        e.preventDefault();
    }
    const currentBinaryFileStore = useCurrentBinaryFileStore();
    const hexViewerConfigStore = useHexViewerConfigStore();
    const moveDiff = calculateMoveDiff(e, hexViewerConfigStore.rowSize);
    if (currentBinaryFileStore.selectionStart === -1 || !moveDiff) return;

    const fileLength = currentBinaryFileStore.fileContent.byteLength - 1;
    const isSelectionMove = e.shiftKey;

    const [newStart, newEnd] = calculateNewStartEnd(
        currentBinaryFileStore.selectionStart,
        currentBinaryFileStore.selectionEnd,
        currentBinaryFileStore.selectionPivot,
        moveDiff, fileLength, isSelectionMove
    );

    if (newStart === newEnd) {
        currentBinaryFileStore.updateSelectionPoint(newStart, HEX_VIEWER_SOURCE);
    } else {
        currentBinaryFileStore.updateSelectionRange(newStart, newEnd, HEX_VIEWER_SOURCE);
    }
};