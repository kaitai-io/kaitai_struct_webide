import {defineStore} from "pinia";
import {IExportedValue} from "../entities";
import {getStoredSelection, storeSelection} from "../v1/utils/LocalStorageCookiesAPI";
import {flattenIExportedValueToLeafsOnly} from "../v1/utils/ExportedValueMappers";

export interface CurrentBinaryFile {
    fileContent: ArrayBuffer;
    parsedFile?: IExportedValue;
    parsedFileFlattened?: IExportedValue[];
    selectionPivot: number;
    selectionStart: number;
    selectionEnd: number;
}

const hasSelectionPresent = (store: CurrentBinaryFile) => {
    return store.selectionPivot !== -1;
};

export const useCurrentBinaryFileStore = defineStore("SelectionStore", {
    state: (): CurrentBinaryFile => {
        const value = getStoredSelection();
        return {
            fileContent: new ArrayBuffer(0),
            selectionStart: value.start || -1,
            selectionEnd: value.end || -1,
            selectionPivot: value.pivot || -1,
            parsedFileFlattened: null,
        };
    },
    actions: {
        updateSelectionPoint(point: number, source: string) {
            this.selectionStart = point;
            this.selectionEnd = point;
            this.selectionPivot = point;
            storeSelection(this);
        },
        updateSelectionRange(startNew: number, endNew: number, source: string) {
            const min = Math.min(startNew, endNew);
            const max = Math.max(startNew, endNew);

            this.selectionStart = min;
            this.selectionEnd = max;

            storeSelection(this);
        },
        updateSelectionPivot(point: number, source: string) {
            this.selectionPivot = point;
        },
        newBinaryFileSelected(filePath: string, fileContent: ArrayBuffer) {
            this.fileContent = fileContent;
            this.selectionStart = -1;
            this.selectionEnd = -1;
            this.selectionPivot = -1;
            this.fileName = filePath;
            storeSelection(this);
        },
        deselect() {
            this.selectionStart = -1;
            this.selectionEnd = -1;
            this.selectionPivot = -1;
            storeSelection(this);
        },
        updateParsedFile(parsedFile: IExportedValue) {
            this.parsedFile = parsedFile;
            this.parsedFileFlattened = flattenIExportedValueToLeafsOnly(parsedFile);
        },
    }
});