import {defineStore} from "pinia";

export interface HexViewerConfigStore {
    selectionDragStart: number;
    rowSize: number;
    columns: number;
    emojiMode: boolean;
    useHexForAddresses: boolean;
}

const serializeConfigToLocalStorage = (store: HexViewerConfigStore) => {
    const config = JSON.stringify({
        selectionDragStart: store.selectionDragStart,
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
            selectionDragStart: -1,
            rowSize: 16,
            columns: 8,
            emojiMode: false,
            useHexForAddresses: true
        };
    },
    actions: {
        updateSelectionDragStart(point: number) {
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
