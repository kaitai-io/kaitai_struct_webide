import {CurrentBinaryFile} from "../../Stores/CurrentBinaryFileStore";

export interface LocalStorageSelection {
    start: number;
    end: number;
    pivot: number;
}

export const getStoredSelection = (): LocalStorageSelection | undefined => {
    const value = localStorage.getItem("selection");
    return value !== null ? JSON.parse(value) : null;
};

export const storeSelection = (store: CurrentBinaryFile): void => {
    const state: LocalStorageSelection = {
        start: store.selectionStart,
        end: store.selectionEnd,
        pivot: store.selectionPivot
    };
    localStorage.setItem("selection", JSON.stringify(state));
};