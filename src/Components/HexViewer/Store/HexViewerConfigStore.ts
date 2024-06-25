import {defineStore} from "pinia";
import {ProcessedLetter} from "../Types";

export interface HexViewerConfigStore {
    selectionDragStart: ProcessedLetter;
    rowSize: number;
    columns: number;
    emojiMode: boolean;
    useHexForAddresses: boolean;
}

const serializeConfigToLocalStorage = (store: HexViewerConfigStore) => {
    const config = JSON.stringify({
        rowSize: store.rowSize,
        columns: store.columns,
        emojiMode: store.emojiMode,
        useHexForAddresses: store.useHexForAddresses
    });
    localStorage.setItem("HexViewerStore", config);
};

export const useHexViewerConfigStore = defineStore("HexViewerStore", {
    state: (): HexViewerConfigStore => {
        return JSON.parse(localStorage.getItem("HexViewerStore")) || {
            selectionDragStart: null,
            rowSize: 16,
            columns: 8,
            emojiMode: false,
            useHexForAddresses: true
        };
    },
    actions: {
        updateSelectionDragStart(point: ProcessedLetter) {
            this.selectionDragStart = point;
            serializeConfigToLocalStorage(this);
        },
        setColumns(columns: number) {
            this.columns = columns;
            serializeConfigToLocalStorage(this);
        },
        setRowSize(rowSize: number) {
            this.rowSize = rowSize;
            serializeConfigToLocalStorage(this);
        },
        setEmojiMode(emojiMode: boolean) {
            this.emojiMode = emojiMode;
            serializeConfigToLocalStorage(this);
        },
        setUseHexForAddresses(addressMode: boolean) {
            this.useHexForAddresses = addressMode;
            serializeConfigToLocalStorage(this);
        },
    }
});
